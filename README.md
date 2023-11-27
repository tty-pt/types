# @tty-pt/types
> Automatic fetching and displaying of data through declarative data types.

This library is indended to facilitate displaying data on simple components by
having a model of your data.

It can save you A lot of coding in you application!

With it, you can easily grab data from a "MetaHandler" from whatever sources,
and use it anywhere with the same API (agnostic to how you fetch the data).

# Installation
```sh
npm i --save-dev @tty-pt/types
```

# Simple Example

Here, we don't use a MetaHandler, just some other features of types, to display a simple table:
```jsx
import { Str, Table } from "@tty-pt/types"

const type = new Shape("Actor", {}, {
	name: new Str("Name"),
});

export default function NameTable() {
	return (<Table 
		type={type}
		data={[{ name: "Joe Smith" }]}
		columns={[ "name" ]}
		options={{}}
		details={[[ "name" ]]}
	/>);
}
```

# Slightly More Advanced Example
```jsx
import { Str, Shape, Enum, Bool } from "@tty-pt/types";
import { IconGood, IconBad, IconNeutral } from "example";
import { fetcher, indexer } from "lib/dependencies";

const STATE = {
	good: 0,
	bad: 1,
	neutral: 2,
};

const STATE_MAP = {
	0: { title: "good", icon: IconGood },
	1: { title: "bad", icon: IconBad },
	1: { title: "neutral", icon: IconNeutral },
};

const incomingType = new Shape("Actor", {}, {
	name: new Str("Name"),
	state: new Enum("State", {
		default: STATE.good, // data will be set to this, even if it is not received
		getter: (_, data) => data.deeper.state
	}, STATE, STATE_MAP);
	alive: new Bool("Alive", {
		// a global meta handler will run these calls, but not a local one.
		onChange: (value) => console.log("Alive changed", value),
       }, STATE, STATE_MAP),
});

class ExampleMetaHandler extends MetaHandler {
	constructor(type, options = {}) {
		super(type, options.fetcher, options.indexer, options);
	}
}

function createHandler(type, options = {}) {
	return new MetaHandler(type, options.fetcher, options.indexer, options);
}


// most of the above could easily be in other files and be shared across views

// if you had a different outcoming type from the incoming type,
// you would provide an "adapter" to map the data to the options argument
const tableHandler = createHandler(incomingType, { fetcher, indexer });
const outgoingType = incomingType;

function App() {
	const data = useMeta(tableHandler);
	return (<Table
		type={outgoingType}
		data={data}
		columns={["name", "state", "alive"]}
		options={{}}
	/>);
}
```

# Meta properties
For every type, the first argument of the constructor is the title of the data field.
This text is shown in the details and table header. The second (optional) argument is "meta":
It can be used to customize the behavior of the type. In this section we discuss the "meta"
properties that can be used in all types.

## getter
This is a **function** with the following signature:
```js
function getter(type, data, meta, parentKey) { /* ... */ }
```
It is used to customize how the data is obtained.

## from
This is a **string** but it is somewhat similar to "getter", it is used to automatically fetch from a property of "data".

## default
When the data is undefined, return the value of this property.

## onChange
This is a **function** with the following signature:
```js
function onChange(value) { /* ... */ }
```
It will be run if the MetaHandler has an option named "global",
and if the data corresponding to the data field of the type has changed.
This is useful to have global onChange logic outside of components.

## na
This is the value of the declaration to be used when the value of the type is undefined.

## naTooltip
This is the value of the tooltip to displayed on undefined values.

## t
Instance of a function that does string internationalization.

# Base types
These are some base types provided with this library. These types have a lot of functionalities associated with them. For example they can render their value using icons, in most cases. They each have slightly different ways of being displayed in different situations, and to be filtered through.

## Integer
> An integer number
```js
const type = new Integer("Age"); // or new Integer("Age", { default: 0 })
```

## Str
> A String
```js
const type = new Str("Name"); // or new Str("Name", { default: "Joe" })
```

## Component
> Same as Str but it is used for rendering components.
This serves to provide generic functionality to many other types.

## Percent
> A percentual value between 0 and 100. This shows any of a number of icons, according to its value.
```js
const type = new Percent("Battery", {}, [IconA, IconB, IconC]);
```

## Enum
> An Enum or an integer value that corresponds to some properties.
```js
const type = new Enum("Status", {}, declaration, map);
```

## Bool
> Like Enum but for boolean values
```js
const map = {
	[true]: { title: "true", icon: TrueIcon },
	[false]: { title: "false", icon: FalseIcon },
};

const type = new Bool("Status", {}, map);
```

## Checkbox
> Like Bool but renders a checkbox instead of an icon
```js
const type = new Checkbox("Status", {}, map);
```

## Shape
> Like Bool but it has a notion of recursion. It has a map of sub-types.
```js
const type = new Shape("Human", {}, map, {
	name: new Str("Name"),
	age: new Integer("Age"),
});
```

## Dictionary
> Like Shape but it has a different notion of recursion. It has a map in which each key may correspond to a value of a certain type.
```js
const type = new Dictionary("Names", {}, map, Str, []);
```
Fourth argument is the SubType, and the fifth is the array of arguments provided to the SubType constructor.

## DateTime
> This has a value of type Date.

```js
const type = new DateTime("DateTime"); // or new DateTime("Time", { format: "time", measure: 0.001 });
```

This type has the following custom meta properties:

### measure
> This meta property is a numeric value. This value is to be multiplied by the received data in order to get the Date object.

### format
> This is used to customize the way that the DateTime string is presented. This can be "date", "time" or other values. If the value is "date", only the date is shown, if it is "time" only the time is shown. Otherwise the time is always shown, and the date is shown when it differs from current date.

## Fun
> This is of a Function type. It is rendered as a button that calls that function.

```js
const type = new Fun("Callback");
```

# MetaHandler
> This is a class that helps fetch data based on type information.

```js
const options = {}
const exampleHandler = new MetaHandler(type, fetcher, indexer, options);
```
It receives four arguments in the constructor, the type, the fetcher, the indexer and the options object.

## Fetcher
Fetcher is an instance of a class that must have three methods: getAll, subscribe and unsubscribe.
The getAll method receives a callback with the received data as an argument.
The subscribe method receives a callback with the received data as an argument. And it returns a subscription key.
The unsubscribe method receives a subscription key.

## Indexer
Indexer is an instance of a class that must have two methods: subscribe and unsubscribe.
The subscribe method receives a callback with the received data as an argument. And it returns a subscription key.
The unsubscribe method receives a subscription key.

# Extending existing types
Now suppose you want to create a type based on Dictionary, but that has a preset map that it uses.
So that we don't need to provide the map every time you want a field of that type. You can do something like this:

```js
// file: src/types.js
import { extend, Dictionary as InnerDictionary } from "@tty-pt/types";

export class Dictionary extends InnerDictionary {
  constructor(title, meta, SubType, subTypeArgs) {
    super(title, meta, BOOL_STATUS_MAP, SubType, subTypeArgs);
  }
}

Dictionary.extend = (SubType, subTypeArgs = [], options = {}) =>
  extend(Dictionary, [SubType, subTypeArgs], options);
```

Then you can use it like so:

```js
// file: src/views/Test.js
import { Dictionary } from "../types";

const type = new Dictionary("Names", {}, Str, []);

/* ... */
```

You can also do the following signature to easily extend one of these classes:
```js
export const Status = Bool.extend(BOOL_STATUS_MAP);
```

# Component API
> To simplify specifying the props of the components, we will use typescript as pseudo-code.

## Table
```typescript
// I will explain the following line a bit later, if you don't mind.
const Filters = (string | { filters: Filters, className: string } | React.ElementType)[];

interface TooltipProps {
	tooltip: string;
	children: React.Node;
	className: string;
}

interface GlobalFilterProps {
	value: any;
	dataKey: string; // TODO rename to typeKey
	onChange: any => void; // TODO fix return type
}

// these are classNames
interface Cast {
	invalid: string, // invalid field
	line: string, // draw a line
	rotate: string, // rotate 90 degrees
	outline: string, // outline all round
	TextCenter: string, // center text
	FHCenter: string, // flex center
	Table: {
		root: string,
		title: string,
		table, // main table component
		th: string,
		td: string,
		Toolbar: {
			root: string,
			content: string, // usually contains filters
		},
	},
	Label: {
		title: string,
	},
	Details: {
		root: string,
		column:  string,
		header: string, // the main line
		container:  string, // for recurse types
		title: string, // left side of header
	},
	List: {
		root: string,
		Toolbar: string,
	},
	Tooltip: {
		root: string,
		content: string,
	},
	TooltipCircle: string,
	Str: {
		Filter: string,
	},
	DateTime: {
		Filter: string,
	},
	Enum: {
		Label: string,
		Filter: {
			root: string,
			active: string, // active chip
			inactive: string, // inactive chip
		},
	},
}

interface TableProps {
	columns: string[]; /* here you can specify paths to things that will be displayed,
		 	    * for example robot.name. This is similar to what you can give
			    * as filters. You can also give strings like these to filters.
			    */
	filters: Filters; // Sorry, please wait a bit more for a full explanation.
	data: object[]; // Simply the data that is received for example from a MetaHandler.
	icons: { // mui icons or similar
		DetailPanel: React.Component; // expand icon (FIXME)
	};
	details?: string[][]; // these can only be simple words for now (FIXME)
	t?: string => string; // translate functionality
	type: Shape;
	title?: string;
	name?: string; // used for identifying which inputs belong to this table, in case the table has inputs.
	components?: {
		Tooltip?: React.Component<TooltipProps>; // Custom Tooltip for detail headers
	};
	cast?: Cast;
	renderValue?: Boolean; // do you wish to render icons for enums, etc?
	titleFormat?: string => string; // you can change how titles are displayed here
	detailsTable?: Boolean; // do you wish to try to show details as sub-tables?
	global?: { // provide this to specify that you want some sort of global filtering
		filter?: (type: BaseType, item: object, filters: object) => Boolean;
		Component?: React.Component<GlobalFilterProps>;
	};
}
```

## List
Well this is just to display a list of components. It has no special use other than filtering. The API may change.

```typescript
interface ListItemProps {
	index: Number;
	data: object;
}

interface ListProps {
	data: object[];
	style: object;
	type: Shape;
	filters: Filters; // just a bit more...
	onClick: object; // FIXME
	Component: React.Component<ListItemProps>;
	[key: string]?: any;
}
```

# Filters
Filters, as previously stated, has a format like the following:

```typescript
const Filters = (string | { filters: Filters, className: string } | React.ElementType)[];
```

So, it is an array. It can be an array of strings, Elements or that option in the middle. Aka:

```typescript
const BoxFilters = { filters: Filters, className: string };
```

If it is in this format, well it has a sort of recursive behavior in which you can specify the layout a bit better to account for a couple of situations.
