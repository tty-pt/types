export {
  IntegerType,
  StringType,
  ComponentType,
  PercentType,
  EnumType,
  RecurseBoolType,
  ButtonType,
  ModalType,
  BaseToggleType,
  ToggleType,
  DateTimeType,
} from "./data-types";
import PropTypes from "./prop-types";
export { Enum, makeEnum, makeBool, makeRecurseBool } from "./Enum";
export { Percent, makePercent } from "./Percent";
import InnerTooltipCircle from "./TooltipCircle";
import InnerTable from "./Table";
import InnerList from "./List";

export const Table = InnerTable;
export const List = InnerList;
export const MyPropTypes = PropTypes;
export const TooltipCircle = InnerTooltipCircle;
