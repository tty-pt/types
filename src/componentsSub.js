import { Sub } from "@tty-pt/sub";
const componentsSub = new Sub({});
globalThis.types = {
  components: componentsSub,
};
export default componentsSub;
