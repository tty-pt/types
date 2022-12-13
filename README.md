# react-data-types
> Automate table and filter creation and other things by having your data models in the client.

This library is intended to facilitate rendering tables and table details by declaring types of data for each of the columns, as well as for what they might represent in the details view.

# Installation
```sh
npm i --save react-data-types
```

# Usage
The following example will show a simple table and its details:

```js
import { StringType, Table } from "react-data-types";

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
	This is a way to define an acessor for the value of the type. The return value of this function is used to render the column and also details icon. It is also used in other situations, depending on the type.

- format(value)
	The return value of this method is used to print out textual information in the details.

- invalid(value)
	If this function's return value is true, the textual information mentioned above has "invalid" styling.
