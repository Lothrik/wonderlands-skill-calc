class BidirectionalMap {
	fwdMap = {}
	revMap = {}

	constructor(map) {
		this.fwdMap = { ...map }
		this.revMap = Object.keys(map).reduce(
				(acc, cur) => ({
					...acc,
					[map[cur]]: cur,
				}),
				{}
		)
	}

	get(key) {
		return this.fwdMap[key] || this.revMap[key]
	}

	add(pair) {
		this.fwdMap[pair[0]] = pair[1]
		this.revMap[pair[1]] = pair[0]
	}
}

const playerClasses = new BidirectionalMap({
	none: 0,
	brrzerker: 1,
	clawbringer: 2,
	graveborn: 3,
	spellshot: 4,
	sporewarden: 5,
	stabbomancer: 6,
});

function splitMulti(str, tokens) {
	var tempChar = tokens[0];
	for(var i = 1; i < tokens.length; i++){
		str = str.split(tokens[i]).join(tempChar);
	}
	str = str.split(tempChar);
	return str;
}

var splitOrig = String.prototype.split;
String.prototype.split = function (){
	if(arguments[0].length > 0){
		if(Object.prototype.toString.call(arguments[0]) == "[object Array]") {
			return splitMulti(this, arguments[0]);
		}
	}
	return splitOrig.apply(this, arguments);
};

function setClass(event) {
	let className = playerClasses.get(this.selectedIndex);
	let classNameFull = this.options[this.selectedIndex].text;
	let classColor = "";
	if (className == "sporewarden" || className == "clawbringer") {
		classColor = "green";
	} else if(className == "brrzerker" || className == "spellshot") {
		classColor = "blue";
	} else if(className == "stabbomancer" || className == "graveborn") {
		classColor = "red";
	}
	if (this.id == "primaryClassSelector") {
		rebuildHTML(className, ["#primaryActionSkills", "#primaryClassFeat", "#primaryTree"]);
		$("#primaryTree").removeClass("red green blue").addClass(classColor);
		$("#primaryClassName").text(classNameFull);
	} else {
		rebuildHTML(className, ["#secondaryActionSkills", "#secondaryClassFeat", "#secondaryTree"]);
		$("#secondaryTree").removeClass("red green blue").addClass(classColor);
		$("#secondaryClassName").text(classNameFull);
	}
	if ($("#primaryClassName").text() == "None" && $("#secondaryClassName").text() == "None") {
		$("#errorMessage").text("No class selected.").removeClass("hidden");
		$("#featSummaryHeader").text("");
		$("#primaryClassFeat").html("");
		$("#secondaryClassFeat").html("");
		$("#summarySpacer").addClass("hidden");
	} else {
		$("#errorMessage").addClass("hidden");
		$("#featSummaryHeader").text("List of Feats");
		$("#summarySpacer").removeClass("hidden");
		if ($("#primaryClassName").text() == "None") {
			$("#primaryClassFeat").css({ "padding": "0px" });
			$("#secondaryClassFeat").css({ "padding": "0px", "max-width": "850px" });
		} else if ($("#secondaryClassName").text() == "None") {
			$("#primaryClassFeat").css({ "padding": "0px", "max-width": "850px" });
			$("#secondaryClassFeat").css({ "padding": "0px" });
		} else {
			$("#primaryClassFeat").css({ "padding": "0 10px 0 0", "max-width": "" });
			$("#secondaryClassFeat").css({ "padding": "0 0 0 10px", "max-width": "" });
		}
	}
}

function rebuildHTML(className, targetElements) {
	$.get("classes/" + className + ".html", function(data) {
		$.each(["actionSkill", "classFeat", "skillTree"], function(index, key) {
			let constructedHTML = "";
			$(data).each(function(_, htmlFragment) {
				if ($(htmlFragment).attr("class") == key) {
					constructedHTML += $(htmlFragment)[0].outerHTML;
				}
			});
			$(targetElements[index]).html(constructedHTML);
		});
		updateClassSelection();
	}, "html");
}

function updateClassSelection() {
	$(".skill, .actionSkill, .skillTree").off();
	$(".skill, .actionSkill").mousedown(handleMouseDown);
	$(".skill, .actionSkill").mouseup(handleMouseUp);
	$(".skillTree, .actionSkill").bind("contextmenu", function() { return false; });
	if (!finishedLoading) {
		loadFromHash(1);
	}
	updateActionSkills();
	$(".skills").each(function(index) {
		updatePassiveSkills($(this));
	});
	updateStats();
	saveToHash(finishedLoading ? 2 : 0);
}

var mousedownBegin;
var lastTouched;
var touchTimer;

var primaryClassEventListener = $("#primaryClassSelector").on("change", setClass);
var secondaryClassEventListener = $("#secondaryClassSelector").on("change", setClass);

function handleMouseDown(event) {
	switch (event.which) {
		case 1: // left mouse button
			window.clearTimeout(touchTimer);
			mousedownBegin = (new Date()).getTime();
			lastTouched = $(this);
			touchTimer = window.setTimeout("checkLongTouch(true)", 500);
			break;
	}
	event.preventDefault();
}

function handleMouseUp(event) {
	switch (event.which) {
		case 1: // left mouse button
			window.clearTimeout(touchTimer);
			checkLongTouch(false);
			break;
		case 3: // right mouse button
			updatePoints($(this), -1);
			break;
	}
	event.preventDefault();
}

function checkLongTouch(fromTimer) {
	if (lastTouched !== null) {
		if (fromTimer === true) {
			for (let i = 0; i < 4; i++) {
				updatePoints(lastTouched, -1);
			}
		} else {
			updatePoints(lastTouched, 1);
		}
		lastTouched = null;
	}
}

function updatePoints(skillHandle, change) {
	if (skillHandle[0].classList.contains("actionSkill")) {
		$(".actionSkill").each(function () {
			if (change == 1) {
				if ($(this).is(skillHandle)) {
					$(this).attr("data-points", 1);
				} else {
					$(this).attr("data-points", 0);
				}
			} else if ($(this).is(skillHandle)) {
				$(this).attr("data-points", 0);
			}
		});
		updateActionSkills();
	} else {
		let tree = skillHandle.parent().parent();
		let thisLevel = parseInt(skillHandle.parent().attr("data-level"));
		let invested = parseInt(skillHandle.parent().attr("data-invested"));
		let tierTotal = parseInt(skillHandle.parent().attr("data-total"));
		let treeTotal = parseInt(tree.find(".totalPoints").text());
		let points = parseInt(skillHandle.attr("data-points"));
		let max = parseInt(skillHandle.attr("data-max"));
		let charLevel = parseInt($("#charLevel").text());
		if (change > 0) {
			if (points < max && treeTotal >= 5 * thisLevel && charLevel < 40) {
				++points;
			}
		} else {
			if (points > 0) {
				let ok = true;
				tree.children(".tier").each(function(index) {
					let level = parseInt($(this).attr("data-level"));
					let total = parseInt($(this).attr("data-total")) - (level == thisLevel ? 1 : 0);
					let invested = parseInt($(this).attr("data-invested")) - (level > thisLevel ? 1 : 0);
					ok &= (
						(level == thisLevel && total == 0 && treeTotal >= invested + total) ||
						(level != thisLevel && total == 0) ||
						(total > 0 && (level * 5 <= invested))
					);
				});
				if (ok) {
					--points;
				}
			}
		}
		skillHandle.attr("data-points", points);
		updatePassiveSkills(tree);
	}
	updateStats();
	saveToHash(1);
}

function updateActionSkills() {
	$(".actionSkill").each(function () {
		let p = parseInt($(this).attr("data-points"));
		let m = parseInt($(this).attr("data-max"));
		$(this).children(".points").text(p + "/" + m);
		$(this).removeClass("partial full");
		if (p != 0) {
			$(this).addClass(p < m ? "partial" : "full");
		}
	});
	let actionSkillNames = [];
	$(".actionSkill > .description > h2").each(function(index, element) {
		actionSkillNames[index] = $(element).text();
	});
	$(".actionSkill > img").each(function(index, element) {
		if ($(".actionSkill:eq(" + index + ") > .label").length === 0) {
			$(element).after('<div class="label">' + actionSkillNames[index] + "</div>");
		}
	});
}

function updatePassiveSkills(treeHandle) {
	let totalPoints = 0;
	$(treeHandle).find(".tier").each(function() {
		$(this).attr("data-invested", totalPoints); // the PREVIOUS tier running total
		let tierLevel = parseInt($(this).attr("data-level"));
		let tierTotal = 0;
		$(this).children(".skill:not(.disabled)").each(function() {
			let p = parseInt($(this).attr("data-points"));
			let m = parseInt($(this).attr("data-max"));
			totalPoints += p;
			tierTotal += p;
			$(this).children(".points").text(p + "/" + m);
			$(this).children(".points").css("visibility", (totalPoints < 5 * tierLevel) ? "hidden" : "visible");
			$(this).removeClass("partial full");
			if (p != 0) {
				$(this).addClass(p < m ? "partial" : "full");
			}
			$(this).find("em").each(function() {
				$(this).removeClass("partial full");
				if (p != 0) {
					$(this).addClass(p < m ? "partial" : "full");
				}
				if ($(this).attr("data-base")) {
					let mod = parseFloat($(this).attr("data-mod")) || 0;
					let base = parseFloat($(this).attr("data-base"));
					let sum = Math.round((Math.max(p, 1) * base + mod) * 100) / 100; // Math.round to eliminate goofy float errors
					if ($(this).attr("data-fixed")) {
						sum = sum.toFixed(1);
					}
					let plus = ($(this).attr("data-base").substring(0, 1) === "+" ? "+" : "");
					$(this).text((sum > 0 ? plus : (sum == 0 ? "" : "-")) + sum + ($(this).attr("data-pct") ? "%" : ""));
				}
			});
			let skillName = $(this).find(".description h2").text();
			$(this).children(".points").after('<div class="label">' + skillName.split(" ").map((n) => n[0]).join("") + "</div>");
		});
		$(this).attr("data-total", tierTotal);
	});
	$(treeHandle).find(".totalPoints").text(totalPoints);
	$(treeHandle).parent().children(".color").height(Math.min(80 + totalPoints * 59.0 / 5 + (totalPoints > 25 ? 21 : 0), 396));
}

function updateStats() {
	let total = 0;
	$(".totalPoints").each(function() {
		total += parseInt($(this).text());
	});
	$("#charLevel").text(total);
	let descriptions = "";
	$(".skill").each(function() {
		let p = parseInt($(this).attr("data-points"));
		if (p > 0) {
			descriptions += '<div class="skillText">';
			let description = $(this).children(".description").html().replace("<h2>", "<strong>").replace("</h2>", " " + p + ':</strong><div class="descriptionText">').split(["<br><br>", "<br>"]);
			description.forEach(function(element, index) {
				if (element.length > 0) {
					if (element[element.length-1] === ".") {
						element += " ";
					} else {
						element += ". ";
					}
					descriptions += element;
				}
			});
			descriptions += "</div></div>";
		}
	});
	$("#skillSummaryHeader").text(total > 0 ? "List of Skills" : "");
	$("#skillSummaryContainer").html(descriptions);
}

function saveToHash(mode) {
	let url = window.location.href.split("#")[0] + "#" + constructHash(mode);
	$("a.permalink").attr("href", url);
	window.location.replace(url);
}

function loadFromHash(mode) {
	if (window.location.hash != "") {
		let curHash = decompressHash();
		// classes have 2 slots: [0, 1]
		if (mode == 0 || mode == 2) {
			$("#primaryClassSelector").prop("selectedIndex", Math.min(curHash.charAt(0), $("#primaryClassSelector option").length - 1));
			$("#secondaryClassSelector").prop("selectedIndex", Math.min(curHash.charAt(1), $("#secondaryClassSelector option").length - 1));
		}
		if (mode == 1 || mode == 2) {
			// action skills have 4 slots: [2, 3, 4, 5]
			for (let i = 0; i < 4; i++) {
				let actionSkill = i < 2 ? $("#primaryActionSkills .actionSkill")[i] : $("#secondaryActionSkills .actionSkill")[i - 2];
				if (actionSkill) {
					actionSkill.setAttribute("data-points", Math.min(curHash.charAt(i + 2), parseInt(actionSkill.getAttribute("data-max"))));
				}
			}
			// passive skills have 42 slots: [6 ... 48]
			for (let i = 0; i < 42; i++) {
				let skill = i < 21 ? $("#primaryTree .skill")[i] : $("#secondaryTree .skill")[i - 21];
				if (skill) {
					skill.setAttribute("data-points", Math.min(curHash.charAt(i + 6), parseInt(skill.getAttribute("data-max"))));
				}
			}
			if (curHash.substr(48, 19).length > 0) {
				$("#characterName").text(curHash.substr(48, 19));
			}
		}
	}
}

function constructHash(mode) {
	let curHash = decompressHash();
	let newHash;
	if (mode == 1) {
		newHash = curHash.substr(0, 2) || "00";
	} else {
		newHash = $("#primaryClassSelector").prop("selectedIndex").toString() + $("#secondaryClassSelector").prop("selectedIndex").toString();
	}
	if (mode == 0) {
		newHash += curHash.substr(2);
	} else {
		for (let i = 0; i < 4; i++) {
			let actionSkill = i < 2 ? $("#primaryActionSkills .actionSkill")[i] : $("#secondaryActionSkills .actionSkill")[i - 2];
			newHash += actionSkill ? actionSkill.getAttribute("data-points") : "0";
		}
		for (let i = 0; i < 42; i++) {
			let skill = i < 21 ? $("#primaryTree .skill")[i] : $("#secondaryTree .skill")[i - 21];
			newHash += skill ? skill.getAttribute("data-points") : "0";
		}
		if ($("#characterName").text() !== "Character Name") {
			newHash += $("#characterName").text().substr(0, 19);
		}
	}
	if ((newHash.length) < 3) {
		return "";
	}
	return compressHash(newHash);
}

function compressHash(rawHash) {
	console.log("compressing " + rawHash);
	if (LZString) {
		let compressedHash = LZString.compressToEncodedURIComponent(rawHash);
		if (compressedHash) {
			return compressedHash;
		}
	}
	return rawHash;
}

function decompressHash() {
	let rawHash = window.location.hash.replace("#", "");
	console.log("decompressing " + rawHash);
	if (LZString) {
		let decompressedHash = LZString.decompressFromEncodedURIComponent(rawHash);
		if (decompressedHash) {
			return decompressedHash;
		}
	}
	return rawHash;
}

var finishedLoading = false;

$(document).ready(function () {
	loadFromHash(0);
	$("#primaryClassSelector").trigger("change");
	$("#secondaryClassSelector").trigger("change");
	setTimeout(function() {
		$("#characterName").removeClass("disabled");
		$("#characterName").on("input", function() { saveToHash(2); });
	}, 100);
	setTimeout(function() {
		finishedLoading = true;
	}, 2500);
});