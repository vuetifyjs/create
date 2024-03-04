import { defineComponent, ref } from 'vue'
import { VTextField } from 'vuetify/components'
import { withEventModifiers } from './directives'

export const HelloWorldTSX = defineComponent({
    name: 'HelloWorld',
    setup() {
        const text = ref('')
        
        return () => (
            <VTextField
                v-model={text.value}
                {...withEventModifiers({
                    onKeyup: () => {
                        console.log('enter event');
                    } 
                  }, ['enter']
                )} 
            />
        )
    }
})