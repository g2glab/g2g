G2GML = prefixes: (PrefixLine*) _ mappings:Mappings { return { "prefixes": prefixes, "mappings": mappings }; }

PrefixLine = "PREFIX" __ prefix:(PrefixName?) _ ":" _ "<" url:([^\n<>]+)	">"	 "\n"
	{
		return `PREFIX ${prefix ? prefix : ''}: <${url.join('')}>`
	}

Mappings =	(_ node:NodeMapping	 _{ return node; }
/ _ edge:EdgeMapping _{ return edge; } )+

NodeMapping = 
	pgPattern:NodeDefinition	___ "\n" rdfPattern:(RDFPattern+)
	{
		return {
			"type": "node",
			"pg": pgPattern,
			"rdf": rdfPattern
		};
	}

EdgeMapping = 
	pgPattern:EdgeDefinition ___ "\n" rdfPattern:RDFPattern+
	{
		return {
			"type": "edge",
			"pg": pgPattern,
			"rdf": rdfPattern
		};
	}

EdgeDefinition = src:NodeDefinition _ "-" _ "[" _ ":" label:Name _ properties:PropertyPart _ "]" _ arrow:("-" ">"?) _ dst:NodeDefinition
{
	return {
				'src': src,
				'dst': dst,
				'label': label,
                'undirected': arrow.join('') != '->',
				'properties': properties
		};
}

RDFPattern = pattern:((indent:__ {return indent.join('');}) (content:([^\n]*) { return content.join(''); })) EndOfLine
{
	return pattern.join('');
}

NodeDefinition = "(" _ variable:Name":" _ label:Name _ properties:PropertyPart _ ")"
{
	return {
			'variable': variable,
			'label': label,
			'properties': properties
		};
}

PropertyPart = "{" _ properties:PropertyList _ "}" { return properties; }
	/ "" { return []; }

PropertyList =
	head:Property _ "," _ tail:PropertyList { return [head].concat(tail); } /
	prop:Property { return [prop]; }
	
Property = key:Name _ ":" _ val:Name
{
	return { 'key': key, 'val': val };
}

Name = head:[a-zA-Z]tail:([0-9a-zA-Z_]*)
{
	return	head + tail.join('');
}

PrefixName =	head:[a-zA-Z]tail:[0-9a-zA-Z_-]* {
	return head + tail.join('');
}

EndOfLine = !. / "\n"

___ "spacer without newline"
	= [ \t]*

__ "tab or spaces"
	= [ \t]+

_ "spacer"
	= [ \t\n\r]*
