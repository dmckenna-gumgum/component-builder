import defaultConfigRaw from './defaultConfig.json';
import { defaultHtml } from './defaultHtml';
import { defaultCss } from './defaultCss';
import { defaultJavascript } from './defaultJavascript';

export const defaultConfig = JSON.stringify(defaultConfigRaw, null, 2);

export {
  defaultHtml,
  defaultCss,
  defaultJavascript
};
