import DataTypes from "./data-types";
import PropTypes from "./prop-types";
import InnerEnum from "./Enum";
import InnerPercent from "./Percent";
import InnerTooltipCircle from "./TooltipCircle";
export { _get } from "./utils";

export const MyPropTypes = PropTypes;
export const Enum = InnerEnum;
export const Percent = InnerPercent;
export const TooltipCircle = InnerTooltipCircle;
export default DataTypes;
