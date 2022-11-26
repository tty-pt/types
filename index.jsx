export {
  IntegerType,
  StringType,
  ComponentType,
  PercentType,
  LevelPercentType,
  EnumType,
  ValueEnumType,
} from "./data-types";
import PropTypes from "./prop-types";
import InnerEnum from "./Enum";
import InnerPercent from "./Percent";
import InnerTooltipCircle from "./TooltipCircle";
import innerMakeTable from "./makeTable";
export { _get } from "./utils";

export const makeTable = innerMakeTable;
export const MyPropTypes = PropTypes;
export const Enum = InnerEnum;
export const Percent = InnerPercent;
export const TooltipCircle = InnerTooltipCircle;
