function removeDep(context, pkg, name, type = "peer") {
	if (pkg[type + "Dependencies"][name]) {
		context.log(`[${pkg.name}] Removing ${name} as a ${type} dependency (https://bit.ly/3jmD8J6).`);
		delete pkg[type + "Dependencies"][name];
	}
}

const readPackage = (pkg, context) => {
	const remove = removeDep.bind(null, context);
	if (pkg.peerDependencies)
		remove(pkg, "react");
	if (pkg.devDependencies)
		remove(pkg, "react", "dev");
	return pkg;
};

module.exports = {
	hooks: {
		readPackage
	}
};
