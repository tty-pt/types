export {
  extend,
  IntegerType,
  StringType,
  ComponentType,
  PercentType,
  EnumType,
  BoolType,
  RecurseBoolType,
  DictionaryOfType,
  // ButtonType,
  // ModalType,
  // BaseToggleType,
  // ToggleType,
  DateTimeType,
} from "./data-types";
import PropTypes from "./prop-types";
import InnerTooltipCircle from "./TooltipCircle";
import InnerTable from "./Table";
import InnerList from "./List";
export { Enum } from "./Enum";
export { Percent } from "./Percent";

export const Table = InnerTable;
export const List = InnerList;
export const MyPropTypes = PropTypes;
export const TooltipCircle = InnerTooltipCircle;
