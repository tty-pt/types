function removeDep(context, pkg, name, type = "peer") {
	const deps = pkg[type + "Dependencies"];
	if (deps && deps[name]) {
		context.log(`[${pkg.name}] Removing ${name} as a ${type} dependency (https://bit.ly/3jmD8J6).`);
		delete pkg[type + "Dependencies"][name];
	}
}

const readPackage = (pkg, context) => {
	const remove = removeDep.bind(null, context);
	remove(pkg, "react");
	remove(pkg, "react-dom");
	remove(pkg, "react", "dev");
	remove(pkg, "react-dom", "dev");
	return pkg;
};

module.exports = {
	hooks: {
		readPackage
	}
};
