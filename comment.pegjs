WithComment = contents:(
	(content:Content (Comment EndOfLine)? { return content; } 
		/ Comment EndOfLine { return ''; })*
)
{
	return contents.join("\n");
}

Comment = "#" [^\n]*

Content = content:((literal:Literal { return literal.join(''); }/ [^#"<])+)
{
	return content.join('');
}

Literal = "\"" (quoted:([^"] / "\\\"")* { return quoted.join(""); })	 "\""
	/ "<" (angled:([^>]*) { return angled.join(""); } )	 ">"

EndOfLine = "\n" / !.

_ "spacer"
	= [ \t\n\r]*
