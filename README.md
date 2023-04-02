# @tty-pt/types
> Automatic fetching and displaying of data through declarative data types.

This library is indended to facilitate displaying data on simple components by having a model of your data. With this model, a lot of things can be automated, like for example displaying data or maybe even getting automatic mock data (future feature). It has two React components we can use to display this "typed" data: A "Table" and a "List". A "Table" inspired in the interface of "material-table", with some changes. And a "List" is just like a list of cards or custom components. In fact you can use data fetched with a "MetaHandler" everywhere.

# Base types
These are some base types provided with this library. These types have a lot of functionalities associated with them. For example they can render their value using icons, in most cases. They each have slightly different ways of being displayed in different situations, and to be filtered through.

## Integer
> An integer number

## String
> A String

## Component
> Same as String but it is used for rendering components.

## Percent
> A percentual value between 0 and 100

## Enum
> An Enum or an integer value that corresponds to some properties.

## Bool
> Like Enum but for boolean values

## Checkbox
> Like Bool but renders a checkbox instead of an icon

## RecurseBool
> Like Bool but it has a notion of recursion. It has a map of sub-types.

## DictionaryOf
> Like Bool but it has a different notion of recursion. It has a map in which each key may correspond to a value of a certain type.

## DateTime
> This has a value of type Date.

## Fun
> This is of a Function type. It is rendered as a button that calls that function.

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

# Installation
```sh
npm i --save-dev @tty-pt/types
```

# Usage
The following example will show a simple table and its details:

```js
import { StringType, Table } from "@tty-pt/types"

export default function NameTable() {
	return (<Table 
		types={{ name: new StringType("Name") }}
		data={[{ name: "Joe Smith" }]}
		columns={[ "name" ]}
		options={{}}
		actions={[]}
		details={[[ "name" ]]}
	/>);
}
```

You can refer to [material-table documentation](https://material-table.com/#/docs/all-props) for most things. Only the "types" prop is new.

Other types exist other than StringType. There is an IntegerType, ComponentType, PercentType, EnumType and RecurseBoolType.

The idea is that this way you only need to define small things for differing types, and it is very easy to add more (you only need to extend existing types).

Depending on the situation, you might have to define some methods in your custom type class.

- read(value)
> This is a way to define an acessor for the value of the type. The return value of this function is used to render the column and also details icon. It is also used in other situations, depending on the type.

- format(value)
> The return value of this method is used to print out textual information in the details.

- invalid(value)
> If this function's return value is true, the textual information mentioned above has "invalid" styling.
