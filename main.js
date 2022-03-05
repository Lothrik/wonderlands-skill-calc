// splitMulti allows String.prototype.split to process multiple delimiters at once
function splitMulti(str, tokens) {
	var tempChar = tokens[0];
	for(var i = 1; i < tokens.length; i++){
		str = str.split(tokens[i]).join(tempChar);
	}
	str = str.split(tempChar);
	return str;
}
var splitOrig = String.prototype.split;
String.prototype.split = function() {
	if(arguments[0].length > 0) {
		if(Object.prototype.toString.call(arguments[0]) == "[object Array]") {
			return splitMulti(this, arguments[0]);
		}
	}
	return splitOrig.apply(this, arguments);
};

// event handlers
var mousedownBegin;
var lastTouched;
var touchTimer;
var backstoryModifiers = {
	nerd: {
		strength: -4,
		dexterity: -2,
		intelligence: 2,
		wisdom: 4,
		constitution: 0,
		attunement: 0
	},
	ratpack: {
		strength: 0,
		dexterity: -2,
		intelligence: 2,
		wisdom: 0,
		constitution: -2,
		attunement: 5
	},
	none: {
		strength: 0,
		dexterity: 0,
		intelligence: 0,
		wisdom: 0,
		constitution: 0,
		attunement: 0
	}
};
const heroStatRegex = /[-\+]+([^%]+)%/;
function handleSwitchButton(event) {
	switch ($(this).text()) {
		default:
		case "Switch to Hero Stats":
			if ($("#primaryClassSelector").val() != "none" || $("#secondaryClassSelector").val() != "none") {
				$("#actionSkills").addClass("hidden");
				$("#skillTrees").addClass("hidden");
				$("#heroStats").removeClass("hidden");
				$(this).text("Switch to Skill Trees");
			}
			break;
		case "Switch to Skill Trees":
			$("#heroStats").addClass("hidden");
			$("#actionSkills").removeClass("hidden");
			$("#skillTrees").removeClass("hidden");
			$(this).text("Switch to Hero Stats");
			break;
	}
}
function formatHeroStat(statValue, statMultiplier) {
	if (statValue >= 10) {
		return "+" + ((statValue - 10) * statMultiplier).toFixed(1) + "%";
	} else {
		return "-" + ((10 - statValue) * statMultiplier).toFixed(1) + "%";
	}
}
function handleHeroStatSlider(event, ignoreEvent) {
	let slider = $(this);
	let sliderValue = Number(slider.val());
	let statName = slider.attr("id").slice(0, -6);
	let statValue = sliderValue + backstoryModifiers[$("#backstorySelector").val() || "none"][statName];
	if (!ignoreEvent) {
		let allocatedHeroPoints = Number($("#strengthSlider").val()) + Number(   $("#dexteritySlider").val()) + Number($("#intelligenceSlider").val()) +
								  Number(  $("#wisdomSlider").val()) + Number($("#constitutionSlider").val()) + Number(  $("#attunementSlider").val()) - 60;
		let charLevel = Number($("#charLevel").text());
		if (allocatedHeroPoints > charLevel) {
			let newValue = Math.max(sliderValue + charLevel - allocatedHeroPoints, 10);
			slider.val(newValue);
			if (allocatedHeroPoints - sliderValue + newValue <= charLevel) {
				slider.trigger("change");
			}
			return false;
		}
	}
	let valueChanged = false;
	switch (statName) {
		default:
		case "strength":
			valueChanged = $("#strengthNumber").text() != statValue;
			$("#strengthNumber").text(statValue);
			$("#strengthText").text($("#strengthText").text().replace(heroStatRegex, formatHeroStat(statValue, 2)));
			break;
		case "dexterity":
			valueChanged = $("#dexterityNumber").text() != statValue;
			$("#dexterityNumber").text(statValue);
			$("#dexterityText").text($("#dexterityText").text().replace(heroStatRegex, formatHeroStat(statValue, 2)));
			break;
		case "intelligence":
			valueChanged = $("#intelligenceNumber").text() != statValue;
			$("#intelligenceNumber").text(statValue);
			$("#intelligenceText").text($("#intelligenceText").text().replace(heroStatRegex, formatHeroStat(statValue, 1)));
			break;
		case "wisdom":
			valueChanged = $("#wisdomNumber").text() != statValue;
			$("#wisdomNumber").text(statValue);
			$("#wisdomText").text($("#wisdomText").text().replace(heroStatRegex, formatHeroStat(statValue, 2)));
			break;
		case "constitution":
			valueChanged = $("#constitutionNumber").text() != statValue;
			$("#constitutionNumber").text(statValue);
			$("#constitutionText").text($("#constitutionText").text().replace(heroStatRegex, formatHeroStat(statValue, 2.5)));
			break;
		case "attunement":
			valueChanged = $("#attunementNumber").text() != statValue;
			$("#attunementNumber").text(statValue);
			$("#attunementText").text($("#attunementText").text().replace(heroStatRegex, formatHeroStat(statValue, 1)));
			break;
	}
	if (!ignoreEvent && valueChanged) {
		saveToHash(1);
	}
}
function handleBackstorySelection(event, ignoreEvent) {
	$(".heroStatSlider").trigger("change", ignoreEvent);
	if (!ignoreEvent) {
		saveToHash(1);
	}
}
function handleClassSelection(event) {
	if (this.id == "primaryClassSelector") {
		rebuildHTML($(this).val(), ["#primaryActionSkills", "#primaryClassFeat", "#primaryTree"]);
	} else {
		rebuildHTML($(this).val(), ["#secondaryActionSkills", "#secondaryClassFeat", "#secondaryTree"]);
	}
}
function updateTreeBackground() {
	$.each([$("#primaryClassSelector option:selected"), $("#secondaryClassSelector option:selected")], function (index, classSelector) {
		let treeBackground = "";
		switch (classSelector.val()) {
			default:
			case "sporewarden":
			case "clawbringer":
				treeBackground = "green";
				break;
			case "brrzerker":
			case "spellshot":
				treeBackground = "blue";
				break;
			case "stabbomancer":
			case "graveborn":
				treeBackground = "red";
				break;
		}
		if (index == 0) {
			$("#primaryTree").removeClass("red green blue").addClass(treeBackground);
			$("#primaryClassName").text(classSelector.text());
		} else {
			$("#secondaryTree").removeClass("red green blue").addClass(treeBackground);
			$("#secondaryClassName").text(classSelector.text());
		}
	});
}
function updateFeatTable() {
	if ($("#primaryClassSelector").val() == "none" && $("#secondaryClassSelector").val() == "none") {
		$("#errorMessage").text("No class selected.").removeClass("disabled");
		$("#heroPoints").addClass("disabled");
		$("#featSummaryHeader").text("");
		$("#primaryClassFeat").html("").css({ "padding": "0", "width": "0" });
		$("#secondaryClassFeat").html("").css({ "padding": "0", "width": "0" });
		$("#summarySpacer").addClass("disabled");
	} else {
		$("#errorMessage").addClass("disabled");
		$("#heroPoints").removeClass("disabled");
		$("#featSummaryHeader").text("List of Feats");
		$("#summarySpacer").removeClass("disabled");
		if ($("#primaryClassSelector").val() == "none") {
			$("#primaryClassFeat").css({ "padding": "0", "width": "0" });
			$("#secondaryClassFeat").css({ "padding": "0", "width": "100%" });
		} else if ($("#secondaryClassSelector").val() == "none") {
			$("#primaryClassFeat").css({ "padding": "0", "width": "100%" });
			$("#secondaryClassFeat").css({ "padding": "0", "width": "0" });
		} else {
			$("#primaryClassFeat").css({ "padding": "0 8pt 0 0", "width": "calc(50% - 8pt)" });
			$("#secondaryClassFeat").css({ "padding": "0 0 0 8pt", "width": "calc(50% - 8pt)" });
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
		updateTreeBackground();
		updateFeatTable();
	}, "html");
}
function restoreHTML() {
	let targetArray = [["#primaryActionSkills", "#primaryClassFeat", "#primaryTree"], ["#secondaryActionSkills", "#secondaryClassFeat", "#secondaryTree"]];
	$.each([$("#primaryClassSelector").val(), $("#secondaryClassSelector").val()], function (targetIdx, className) {
		$.get("classes/" + className + ".html", function(data) {
			$.each(["actionSkill", "classFeat", "skillTree"], function(index, key) {
				let constructedHTML = "";
				$(data).each(function(_, htmlFragment) {
					if ($(htmlFragment).attr("class") == key) {
						constructedHTML += $(htmlFragment)[0].outerHTML;
					}
				});
				$(targetArray[targetIdx][index]).html(constructedHTML);
			});
			$(".skill, .actionSkill, .skillTree").off();
			$(".skill, .actionSkill").mousedown(handleMouseDown);
			$(".skill, .actionSkill").mouseup(handleMouseUp);
			$(".skillTree, .actionSkill").bind("contextmenu", function() { return false; });
			loadFromHash(2);
			updateActionSkills();
			$(".skills").each(function(index) {
				updatePassiveSkills($(this));
			});
			updateStats();
			updateTreeBackground();
			updateFeatTable();
		}, "html");
	});
}
function handleKeyDown(event) {
	if (event.keyCode == 90 && event.ctrlKey) {
		loadPreviousHashFromUndo();
	}
}
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
	if (lastTouched != null) {
		if (fromTimer == true) {
			for (let i = 0; i < 4; i++) {
				updatePoints(lastTouched, -1);
			}
		} else {
			updatePoints(lastTouched, 1);
		}
		lastTouched = null;
	}
}

// core skill calculator functions
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
		let thisLevel = Number(skillHandle.parent().attr("data-level"));
		let invested = Number(skillHandle.parent().attr("data-invested"));
		let tierTotal = Number(skillHandle.parent().attr("data-total"));
		let treeTotal = Number(tree.find(".totalPoints").text());
		let points = Number(skillHandle.attr("data-points"));
		let max = Number(skillHandle.attr("data-max"));
		let charLevel = Number($("#charLevel").text());
		if (change > 0) {
			if (points < max && treeTotal >= 5 * thisLevel && charLevel < 40) {
				++points;
			}
		} else {
			if (points > 0) {
				let ok = true;
				tree.children(".tier").each(function(index) {
					let level = Number($(this).attr("data-level"));
					let total = Number($(this).attr("data-total")) - (level == thisLevel ? 1 : 0);
					let invested = Number($(this).attr("data-invested")) - (level > thisLevel ? 1 : 0);
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
		let p = Number($(this).attr("data-points"));
		let m = Number($(this).attr("data-max"));
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
		if ($(".actionSkill").eq(index).find(".label").length == 0) {
			$(element).after('<div class="label">' + actionSkillNames[index] + "</div>");
		}
	});
}
function updatePassiveSkills(treeHandle) {
	let totalPoints = 0;
	$(treeHandle).find(".tier").each(function() {
		$(this).attr("data-invested", totalPoints); // the PREVIOUS tier running total
		let tierLevel = Number($(this).attr("data-level"));
		let tierTotal = 0;
		$(this).children(".skill:not(.disabled)").each(function() {
			let p = Number($(this).attr("data-points"));
			let m = Number($(this).attr("data-max"));
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
					let plus = ($(this).attr("data-base").slice(0, 1) == "+" ? "+" : "");
					$(this).text((sum > 0 ? plus : (sum == 0 ? "" : "-")) + sum + ($(this).attr("data-pct") ? "%" : ""));
				}
			});
			if ($(this).find(".label").length == 0) {
				let skillName = $(this).find(".description h2").text();
				$(this).children(".points").after('<div class="label">' + skillName.split(" ").map((n) => n[0]).join("") + "</div>");
			}
		});
		$(this).attr("data-total", tierTotal);
	});
	$(treeHandle).find(".totalPoints").text(totalPoints);
	$(treeHandle).parent().children(".color").height(Math.min(80 + totalPoints * 59.0 / 5 + (totalPoints > 25 ? 21 : 0), 396));
}
function updateStats() {
	let total = 0;
	$(".totalPoints").each(function() {
		total += Number($(this).text());
	});
	$("#charLevel").text(total);
	let descriptions = "";
	$(".skill").each(function() {
		let p = Number($(this).attr("data-points"));
		if (p > 0) {
			descriptions += '<div class="skillText">';
			let description = $(this).children(".description").html().replace("<h2>", "<strong>").replace("</h2>", " " + p + ':</strong><div class="descriptionText">').split(["<br><br>", "<br>"]);
			description.forEach(function(element, index) {
				if (element.length > 0) {
					if (element[element.length-1] == ".") {
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

// url hash functions
var hashUndoHistory = [];
function saveToHash(mode) {
	let newHash = constructHash(mode);
	let newURL = window.location.href.split("#")[0] + "#" + newHash;
	$("#permaLink").attr("href", newURL);
	window.location.replace(newURL);
	addHashToUndo(newHash);
}
function loadFromHash(mode) {
	if (window.location.hash.length > 0) {
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
					actionSkill.setAttribute("data-points", Math.min(curHash.charAt(i + 2), Number(actionSkill.getAttribute("data-max"))));
				}
			}
			// passive skills have 42 slots: [6 ... 47]
			for (let i = 0; i < 42; i++) {
				let skill = i < 21 ? $("#primaryTree .skill")[i] : $("#secondaryTree .skill")[i - 21];
				if (skill) {
					skill.setAttribute("data-points", Math.min(curHash.charAt(i + 6), Number(skill.getAttribute("data-max"))));
				}
			}
			// hero stats have 6 double-width slots: [48 ... 59]
			for (let i = 0; i < 6; i++) {
				$(".heroStatSlider").eq(i).val(curHash.slice(48 + i * 2, 50 + i * 2));
			}
			// hero backstory has 1 slot [60]
			$("#backstorySelector").prop("selectedIndex", Math.min(curHash.charAt(60), $("#backstorySelector option").length - 1)).trigger("change", true);
		}
	}
}
function constructHash(mode) {
	let curHash = decompressHash();
	let newHash;
	if (mode == 1) {
		newHash = curHash.slice(0, 2) || "00";
	} else {
		newHash = $("#primaryClassSelector").prop("selectedIndex").toString() + $("#secondaryClassSelector").prop("selectedIndex").toString();
	}
	if (mode == 0) {
		newHash += curHash.slice(2);
	} else {
		for (let i = 0; i < 4; i++) {
			let actionSkill = i < 2 ? $("#primaryActionSkills .actionSkill")[i] : $("#secondaryActionSkills .actionSkill")[i - 2];
			newHash += actionSkill ? actionSkill.getAttribute("data-points") : "0";
		}
		for (let i = 0; i < 42; i++) {
			let skill = i < 21 ? $("#primaryTree .skill")[i] : $("#secondaryTree .skill")[i - 21];
			newHash += skill ? skill.getAttribute("data-points") : "0";
		}
		for (let i = 0; i < 6; i++) {
			newHash += ("00" + $(".heroStatSlider")[i].value).slice(-2);
		}
		newHash += $("#backstorySelector option:selected")[0].index;
	}
	if ((newHash.length) < 3) {
		return "";
	}
	return compressHash(newHash);
}
function addHashToUndo(oldHash) {
	if (hashUndoHistory[hashUndoHistory.length - 1] != oldHash) {
		if (hashUndoHistory.push(oldHash) > 100) {
			hashUndoHistory.shift();
		}
	}
}
function loadPreviousHashFromUndo() {
	hashUndoHistory.pop();
	if (hashUndoHistory.length > 0) {
		let newHash = hashUndoHistory[hashUndoHistory.length - 1];
		let newURL = window.location.href.split("#")[0] + "#" + newHash;
		$("#permaLink").attr("href", newURL);
		window.location.replace(newURL);
		loadFromHash(2);
		restoreHTML();
	}
	return false;
}
function compressHash(rawHash) {
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
	if (LZString) {
		let decompressedHash = LZString.decompressFromEncodedURIComponent(rawHash);
		if (decompressedHash) {
			return decompressedHash;
		}
	}
	return rawHash;
}

// finalize the page once DOM has loaded
var finishedLoading = false;
$(document).ready(function () {
	loadFromHash(0);
	$(document).on("keydown", handleKeyDown);
	$("#switchButton").on("click", handleSwitchButton);
	$(".heroStatSlider").on("change", handleHeroStatSlider);
	$("#backstorySelector").on("change", handleBackstorySelection);
	$("#primaryClassSelector").on("change", handleClassSelection);
	$("#secondaryClassSelector").on("change", handleClassSelection);
	$("#primaryClassSelector").trigger("change");
	$("#secondaryClassSelector").trigger("change");
	setTimeout(function() {
		finishedLoading = true;
	}, 2500);
});