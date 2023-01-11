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
} from "./data-types";
import PropTypes from "./prop-types";
import InnerEnum from "./Enum";
import InnerPercent from "./Percent";
import InnerTooltipCircle from "./TooltipCircle";
import InnerTable from "./Table";
import InnerList from "./List";

export const Table = InnerTable;
export const List = InnerList;
export const MyPropTypes = PropTypes;
export const Enum = InnerEnum;
export const Percent = InnerPercent;
export const TooltipCircle = InnerTooltipCircle;
