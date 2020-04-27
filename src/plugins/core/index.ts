import autocomplete from "./autocomplete";
import quit from "./quit";

const core = new Map<string, (params: neutron.PluginParams) => any>();

core.add('autocomplete', autocomplete);
core.add('quit', quit);

export default core;
