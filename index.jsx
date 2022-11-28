export {
  IntegerType,
  StringType,
  ComponentType,
  PercentType,
  EnumType,
  RecurseBoolType,
} from "./data-types";
import PropTypes from "./prop-types";
import InnerEnum from "./Enum";
import InnerPercent from "./Percent";
import InnerTooltipCircle from "./TooltipCircle";
import InnerTable from "./Table";
export { _get } from "./utils";

export const Table = InnerTable;
export const MyPropTypes = PropTypes;
export const Enum = InnerEnum;
export const Percent = InnerPercent;
export const TooltipCircle = InnerTooltipCircle;
