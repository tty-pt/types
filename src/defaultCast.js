const table = "table-layout size-horizontal border-collapse";
const horizontalCenter = "horizontal flex-wrap align-items";

export default {
  invalid: "color-error-light",
  line: "border-top",
  rotate: "rotate",
  outline: "outline-fg",
  TextCenter: "text-align",
  FHCenter: "horizontal-0 justify-content",
  Table: {
    root: "typed paper overflow",
    title: "h-5",
    table,
    th: "text-overflow overflow-hidden pad",
    td: "pad",
    Toolbar: {
      root: horizontalCenter + " justify-content-space-between",
      content: horizontalCenter + " justify-content-end",
    },
  },
  Label: {
    title: "font-size-14 pad-top-small",
  },
  Details: {
    root: "pad horizontal flex-grow-children",
    column: "overflow-hidden " + table,
    header: "horizontal-small align-items",
    container: "margin-left-small border-top " + table,
    title: "font-weight",
  },
  List: {
    root: "vertical overflow-auto",
    Toolbar: "horizontal flex-wrap align-items-center justify-content-end",
  },
  Tooltip: {
    container: "opacity-biggest",
    root: "vertical-small flex text-align",
    content: "align-items",
  },
  TooltipCircle: "vertical-0 justify-content",
  Str: {
    Filter: "paper horizontal-0",
  },
  DateTime: {
    Filter: "paper pad-small vertical-small",
  },
  Enum: {
    Label: "table-horizontal-small table-vertical-small",
    Filter: {
      root: "horizontal-small align-items-center justify-content-space-between flex-wrap",
      active: "chip-active",
      inactive: "chip",
    },
  },
};
