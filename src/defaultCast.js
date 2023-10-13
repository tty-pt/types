const table = "table-layout size-horizontal border-collapse";
const horizontalCenter = "horizontal flex-wrap align-items";

export default {
  tableParent: "typed paper overflow",
  table,
  container: "margin-left-small border-top " + table,
  header: "horizontal-small align-items",
  invalid: "color-error-light",
  title: "font-weight",
  details: "pad horizontal flex-wrap flex-grow-children",
  detail: "overflow-hidden " + table,
  line: "border-top",
  th: "text-overflow overflow-hidden pad",
  enumLabel: "table-horizontal-small table-vertical-small",
  tooltipContainer: "vertical-small flex text-align",
  typeTitle: "font-size-14 pad-top-small",
  col: "pad",
  rotate: "rotate",
  tooltipContent: "horizontal-0 align-items",
  tooltipCircle: "vertical-0 justify-content",
  toolbar: {
    container: horizontalCenter + " justify-content-space-between",
    title: "h-5",
    content: horizontalCenter + " justify-content-end",
  },
  textCenter: "text-align",
  fhCenter: "horizontal-0 justify-content",
  filtersRoot: "vertical overflow-auto",
  filtersContainer: "horizontal flex-wrap align-items-center justify-content-end",
  type: {
    Str: {
      filter: "paper horizontal-0",
    },
    DateTime: {
      filter: "paper pad-small vertical-small",
    },
    Enum: {
      filter: {
        root: "horizontal-small align-items-center justify-content-space-between flex-wrap",
        active: "chip-active",
        inactive: "chip",
      },
    },
  },
};
