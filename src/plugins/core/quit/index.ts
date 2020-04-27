import { APP_NAME, } from "../../../constants/strings";
import { remote, } from 'electron';
import { search, } from "../../../utils/plugins";
import icon from '../icon.png';

const KEYWORDS = [
  'Quit',
  'Exit',
];

const subtitle = `Quit from ${APP_NAME}`;
const onSelect = () => remote.app.quit();

const fn = ({ term, display, }: neutron.PluginParams) => {
  const result = search(KEYWORDS, term).map(title => ({
    icon,
    title,
    subtitle,
    onSelect,
    term: title,
  }));
  display(result);
};

const quit = {
  fn,
};

export default quit;
