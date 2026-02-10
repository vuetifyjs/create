import { blue } from 'kolorist'
import { getUserAgent } from 'package-manager-detector'
import { box } from 'consola/utils'

function supportsColor (): boolean {
  const testText = 'test'
  const coloredText = blue(testText)
  return coloredText !== testText
}

export function createBanner (): string {
  if (!supportsColor()) {
    return createPlainBanner()
  }

  return '[38;2;22;151;246mV[39m[38;2;22;147;242mu[39m[38;2;22;144;238me[39m[38;2;22;140;234mt[39m[38;2;23;136;229mi[39m[38;2;23;133;225mf[39m[38;2;23;129;221my[39m[38;2;23;125;217m.[39m[38;2;23;121;213mj[39m[38;2;23;118;209ms[39m [38;2;24;114;204m-[39m [38;2;24;110;200mM[39m[38;2;24;107;196ma[39m[38;2;24;103;192mt[39m[38;2;32;110;197me[39m[38;2;39;118;202mr[39m[38;2;47;125;207mi[39m[38;2;54;132;211ma[39m[38;2;62;140;216ml[39m [38;2;70;147;221mC[39m[38;2;77;154;226mo[39m[38;2;85;161;231mm[39m[38;2;93;169;236mp[39m[38;2;100;176;240mo[39m[38;2;108;183;245mn[39m[38;2;115;191;250me[39m[38;2;123;198;255mn[39m[38;2;126;199;255mt[39m [38;2;129;201;255mF[39m[38;2;133;202;255mr[39m[38;2;136;204;255ma[39m[38;2;139;205;255mm[39m[38;2;142;207;255me[39m[38;2;145;208;255mw[39m[38;2;149;210;255mo[39m[38;2;152;211;255mr[39m[38;2;155;212;255mk[39m [38;2;158;214;255mf[39m[38;2;161;215;255mo[39m[38;2;164;217;255mr[39m [38;2;168;218;255mV[39m[38;2;171;220;255mu[39m[38;2;174;221;255me[39m'
}

export function createPlainBanner (): string {
  return 'Vuetify - Vue Component Framework'
}

export function createBetaBanner () {
  const packageManager = getUserAgent()
  return box(`${packageManager ?? 'npm'} create vuetify@beta`, { title: 'Try new vuetify-create with better customization and presets support!', style: { borderColor: 'blueBright' } })
}
