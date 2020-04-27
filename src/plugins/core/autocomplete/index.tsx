import plugins from "../../index";
import { search, } from "../../../utils/plugins";
import { filter, flow, map, partialRight, values, } from 'lodash/fp';

const toString = (plugin: neutron.Plugin): string => plugin.keyword;
const notMatch = (term: string) => (plugin: neutron.Plugin): boolean => (
  plugin.keyword !== term && `${plugin.keyword} ` !== term
);

const pluginToResult = (actions: any) => (res: any): neutron.Result => ({
  title: res.name,
  icon: res.icon,
  term: `${res.keyword} `,
  onSelect: (event: Event) => {
    event.preventDefault();
    actions.replaceTerm(`${res.keyword} `);
  },
} as neutron.Result);

const fn = ({ term, display, actions, }: neutron.PluginParams) => flow(
  values,
  filter(plugin => !!plugin.keyword),
  partialRight(search, [ term, toString, ]),
  filter(notMatch(term)),
  map(pluginToResult(actions)),
  display
)(Object.fromEntries(plugins));

const autocomplete = {
  name: 'Plugins autocomplete',
  fn,
};

export default autocomplete;
