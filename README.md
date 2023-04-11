# @tty-pt/types
> Automatic fetching and displaying of data through declarative data types.

This library is indended to facilitate displaying data on simple components by having a model of your data.
With this model, a lot of things can be automated, like for example displaying data or maybe even getting
automatic mock data (future feature) and also the fetching of the data (current feature).
It has two React components we can use to display this "typed" data: A "Table" and a "List".
A "Table" inspired in the interface of "material-table", with some changes.
And a "List" is just like a list of cards or custom components.
In fact you can use data fetched with a "MetaHandler" everywhere.

# Installation
```sh
npm i --save-dev @tty-pt/types
```

# Simple Example
```jsx
import { String, Table } from "@tty-pt/types"

const type = new RecurseBool("Actor", {}, {
	name: new String("Name"),
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
import { String, RecurseBool, Enum, Bool } from "@tty-pt/types";
import { IconGood, IconBad, IconNeutral } from "example";
import dependencies from "lib/dependencies";

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

const incomingType = new RecurseBool("Actor", {}, {
	name: new String("Name"),
	state: new Enum("State", {
		if: (_, data) => data.shouldReadState, // as long as this is true
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
		super(type, options.dependencies.fetcher, options.dependencies.indexer, options);
	}
}

// if you had a different outcoming type from the incoming type,
// you would provide an "adapter" to map the data to the options argument
const tableHandler = new ExampleMetaHandler(incomingType, { dependencies });
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

## String
> A String
```js
const type = new String("Name"); // or new String("Name", { default: "Joe" })
```

## Component
> Same as String but it is used for rendering components.
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
	[true]: { title: "true", Icon: TrueIcon },
	[false]: { title: "false", Icon: FalseIcon },
};

const type = new Bool("Status", {}, map);
```

## Checkbox
> Like Bool but renders a checkbox instead of an icon
```js
const type = new Checkbox("Status", {}, map);
```

## RecurseBool
> Like Bool but it has a notion of recursion. It has a map of sub-types.
```js
const type = new RecurseBool("Human", {}, map, {
	name: new String("Name"),
	age: new Integer("Age"),
});
```

## DictionaryOf
> Like RecurseBool but it has a different notion of recursion. It has a map in which each key may correspond to a value of a certain type.
```js
const type = new DictionaryOf("Names", {}, map, String, []);
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
Now suppose you want to create a type based on DictionaryOf, but that has a preset map that it uses.
So that we don't need to provide the map every time you want a field of that type. You can do something like this:

```js
// file: src/types.js
import { extend, DictionaryOf as InnerDictionaryOf } from "@tty-pt/types";

export class DictionaryOf extends InnerDictionaryOf {
  constructor(title, meta, SubType, subTypeArgs) {
    super(title, meta, BOOL_STATUS_MAP, SubType, subTypeArgs);
  }
}

DictionaryOf.extend = (SubType, subTypeArgs = [], options = {}) =>
  extend(DictionaryOf, [SubType, subTypeArgs], options);
```

Then you can use it like so:

```js
// file: src/views/Test.js
import { DictionaryOf } from "../types";

const type = new DictionaryOf("Names", {}, String, []);

/* ... */
```

You can also do the following signature to easily extend one of these classes:
```js
export const Status = Bool.extend(BOOL_STATUS_MAP);
```
