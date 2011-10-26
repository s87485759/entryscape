dojo.provide("conxilla.style.defaults");

conxilla.style.defaultStyleSet = {
	baseStyle: {
		boxStyle: 'rectangle', 
		boxFilled: false, 
		textVisible: true, 
		boxBorderStyle: 'solid', 
		boxBorderThickness: 2, 
		lineStyle: 'solid', 
		lineThickness: 2, 
		lineHeadInLineEnd: true,
		lineHeadStyle: 'vArrow', 
		lineHeadFilled: true,
		lineHeadWidth: 8,
		lineHeadLength: 8,
		lineHeadLineThickness: 2,
		boxLineStyle: 'solid', boxLineWidth: 2
	},
	//The following styles will be considered to override the baseStyle. 
	type2style: {
		 activity: {boxStyle: 'roundrectangle'},
		 kindof: {boxStyle: 'none', lineHeadStyle: 'arrow', lineHeadLength: 24, lineHeadWidth: 22, lineHeadFilled: false},
		 has: {lineHeadFilled: false, boxStyle: 'none', lineHeadStyle: 'diamond', lineHeadInLineEnd: false, lineHeadLength: 14, lineHeadWidth: 14},
		 process: {boxStyle: 'eastarrow'},
		 systemboundary: {boxStyle: 'hollowrectangle', textVisible: false}
	},
	boxStyles: {
		diamond: {path: "M0.5 0 L1 0.5 L0.5 1 L0 0.5 L0.5 0", textBox: [0.25, 0.25, 0.5, 0.5]},
		hollowrectangle: {path: "M0 0 L1 0 L1 1 L0 1 L0 0 L0 1 L1 1 L1 0 L0 0", textBox: [0, 0, 1, 1]}
	},
	arrowStyles: {
		arrow: [{x: 0, y: 0}, {x: 1, y: 0.5}, {x: 1, y: -0.5}],
		varrow: [{x: 1, y: 0.5}, {x: 0, y: 0}, {x: 1, y: -0.5}, {x:0, y:0}],
		curvevarrow: [{x: 1, y: 0.5}, {t: "Q", x: 0.5, y: 0}, {x: 0, y: 0}, {t: "Q", x: 0.5, y: 0}, {x: 1, y: -0.5}, {t: "Q", x: 0.5, y: 0}, {x: 0, y: 0}, {t: "Q", x: 0.5, y: 0}, {t: "Q", x: 0.5, y: 0}, {x:1, y:0.5}],
		diamond: [{x: 0, y: 0}, {x: 0.5, y: 0.5}, {x: 1, y: 0}, {x: 0.5, y: -0.5}],
		spear: [{x: 0, y: 0}, {x: 1, y: 0.5}, {t: "Q", x: 0.3, y: 0}, {x: 1, y: -0.5}],
		longspear: [{x: 0, y: 0}, {x: 0.3, y: 0.5}, {t: "Q", x: 0.3, y: 0.2}, {x: 1, y: 0.05}, {t: "L", x: 1, y: -0.05}, {t: "Q", x: 0.3, y: -0.2}, {x: 0.3, y: -0.5}],
		wave: [{x: 0, y: 0}, {t: "C", x: 0.2, y: 0}, {x: 0.1, y: 0.2}, {x: 0.2, y: 0.2}, 
			{t: "C", x: 0.3, y: 0.2}, {x: 0.3, y: -0.3}, {x: 0.4, y: -0.3},
			{t: "C", x: 0.5, y: -0.3}, {x: 0.5, y: 0.4}, {x: 0.6, y: 0.4},
			{t: "C", x: 0.7, y: 0.4}, {x: 0.7, y: -0.5}, {x: 0.8, y: -0.5},
			{t: "C", x: 0.9, y: -0.5}, {x: 0.8, y: 0}, {x: 1.0, y: 0}],
		arrowgram: [{x: 0, y: 0}, {x: 0.5, y: 0.5}, {x: 0.8, y: 0.5}, {x: 0.3, y: 0},{x: 0.8, y: -0.5}, {x: 0.5, y: -0.5}]
	},
	colors: {
		conceptBG: "#ffffff", 
		conceptFocus: "#a22b2b",
		mapBG: "#f2f2b6", 
		mapFG: "#000000", 
		information: "#c3ad36"
	}
};