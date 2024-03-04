// # https://github.com/vuejs/babel-plugin-jsx/issues/596
import { withModifiers, withKeys, capitalize } from 'vue';
import { makeMap } from '@vue/shared';

const isEventOptionModifier = makeMap(`passive,once,capture`);
const isNonKeyModifier = makeMap(
  // event propagation management
  `stop,prevent,self,` +
  // system modifiers + exact
  `ctrl,shift,alt,meta,exact,` +
  // mouse
  `middle`
);
// left & right could be mouse or key modifiers based on event type
const maybeKeyModifier = makeMap('left,right');
const isKeyboardEvent = makeMap(
  `onkeyup,onkeydown,onkeypress`,
  true,
);

export const resolveEventModifiers = ({
  eventName,
  eventModifiers,
}: {
  eventName: string;
  eventModifiers: string[];
}) => {
  const keyModifiers: string[] = [];
  const nonKeyModifiers: string[] = [];
  const eventOptionModifiers: string[] = [];

  for (let i = 0; i < eventModifiers.length; i++) {
    const eventModifier = eventModifiers[i];

    if (isEventOptionModifier(eventModifier)) {
      // eventOptionModifiers: modifiers for addEventListener() options,
      // e.g. .passive & .capture
      eventOptionModifiers.push(eventModifier)
    } else {
      // runtimeModifiers: modifiers that needs runtime guards
      if (maybeKeyModifier(eventModifier)) {
        if (isKeyboardEvent(eventName)) {
          keyModifiers.push(eventModifier);
        } else {
          nonKeyModifiers.push(eventModifier);
        }
      } else {
        if (isNonKeyModifier(eventModifier)) {
          nonKeyModifiers.push(eventModifier);
        } else {
          keyModifiers.push(eventModifier);
        }
      }
    }
  }

  return {
    keyModifiers,
    nonKeyModifiers,
    eventOptionModifiers,
  };
};

export const withEventModifiers = (eventObject: object, modifiers: string[]) => {
  const eventName: string = Object.keys(eventObject)[0];
  const eventFunction: Function = Object.values(eventObject)[0];

  const {
    eventOptionModifiers,
    keyModifiers,
    nonKeyModifiers
  } = resolveEventModifiers({
    eventName,
    eventModifiers: modifiers
  });

  let outputEventName = eventName;
  let outputEventFunction = eventFunction;

  // normalize click.right and click.middle since they don't actually fire
  if (nonKeyModifiers.includes('right')) {
    outputEventName = 'onContextmenu';
  }

  if (nonKeyModifiers.includes('middle')) {
    outputEventName = 'onMouseup';
  }


  if (nonKeyModifiers.length > 0) {
    // @ts-ignore
    outputEventFunction = withModifiers(outputEventFunction, nonKeyModifiers);
  }

  if (
    keyModifiers.length > 0 &&
    // if event name is dynamic, always wrap with keys guard
    isKeyboardEvent(eventName)
  ) {
    // @ts-ignore
    outputEventFunction = withKeys(outputEventFunction, keyModifiers);
  }

  if (eventOptionModifiers.length > 0) {
    const modifierPostfix = eventOptionModifiers.map(capitalize).join('');
    outputEventName = `${outputEventName}${modifierPostfix}`;
  }

  const outputEventObject = {
    [outputEventName]: outputEventFunction,
  };

  return outputEventObject;
};
