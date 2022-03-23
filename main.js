// splitMulti allows String.prototype.split to process multiple delimiters at once
function splitMulti(str, tokens) {
	let tempChar = tokens[0];
	for (let i = 1; i < tokens.length; i++) {
		str = str.split(tokens[i]).join(tempChar);
	}
	str = str.split(tempChar);
	return str;
}
var splitOrig = String.prototype.split;
String.prototype.split = function() {
	if (arguments[0].length > 0) {
		if (Object.prototype.toString.call(arguments[0]) == "[object Array]") {
			return splitMulti(this, arguments[0]);
		}
	}
	return splitOrig.apply(this, arguments);
};

// check browser for AVIF or WEBP support
async function supportsEncode() {
	if (!this.createImageBitmap) return "jpg";
	const avifData = "data:image/avif;base64,AAAAHGZ0eXBtaWYxAAAAAG1pZjFhdmlmbWlhZgAAAPFtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAHmlsb2MAAAAABEAAAQABAAAAAAEVAAEAAAAeAAAAKGlpbmYAAAAAAAEAAAAaaW5mZQIAAAAAAQAAYXYwMUltYWdlAAAAAHBpcHJwAAAAUWlwY28AAAAUaXNwZQAAAAAAAAABAAAAAQAAABBwYXNwAAAAAQAAAAEAAAAVYXYxQ4EgAAAKBzgABpAQ0AIAAAAQcGl4aQAAAAADCAgIAAAAF2lwbWEAAAAAAAAAAQABBAECg4QAAAAmbWRhdAoHOAAGkBDQAjITFkAAAEgAAAB5TNw9UxdXU6F6oA==",
		webpData = "data:image/webp;base64,UklGRhwAAABXRUJQVlA4TBAAAAAvAAAAEAfQpv5HmQMR0f8A",
		avifBlob = await fetch(avifData).then((r) => r.blob());
	return createImageBitmap(avifBlob)
		.then(() => "avif")
		.catch(async() => {
		const webpBlob = await fetch(webpData).then((r) => r.blob());
		return createImageBitmap(webpBlob).then(() => "webp")
	}).catch(() => "jpg");
}
(async () => { document.body.classList.add(await supportsEncode()); })();

// event handlers
var mousedownBegin;
var lastTouched;
var touchTimer;
var actualSkillPoints = 0;
var internalCharLevel = 0;
var hasMultiClass = false;
var multiClassNames = {
	brrzerkerclawbringer: "",
	brrzerkergraveborn: "",
	brrzerkerspellshot: "",
	brrzerkersporewarden: "",
	brrzerkerstabbomancer: "Gladiator",
	clawbringerbrrzerker: "Hammerzerker",
	clawbringergraveborn: "",
	clawbringerspellshot: "",
	clawbringersporewarden: "Cavalier",
	clawbringerstabbomancer: "",
	gravebornbrrzerker: "",
	gravebornclawbringer: "",
	gravebornspellshot: "Lich",
	gravebornsporewarden: "Ghostlight",
	gravebornstabbomancer: "",
	spellshotbrrzerker: "",
	spellshotclawbringer: "Hexecutioner",
	spellshotgraveborn: "",
	spellshotsporewarden: "",
	spellshotstabbomancer: "",
	sporewardenbrrzerker: "",
	sporewardenclawbringer: "",
	sporewardengraveborn: "",
	sporewardenspellshot: "",
	sporewardenstabbomancer: "Pathfinder",
	stabbomancerbrrzerker: "",
	stabbomancerclawbringer: "",
	stabbomancergraveborn: "",
	stabbomancerspellshot: "",
	stabbomancersporewarden: "Ambusher"
}
var backstoryModifiers = {
	none: {
		strength: 0,
		dexterity: 0,
		intelligence: 0,
		wisdom: 0,
		constitution: 0,
		attunement: 0
	},
	thicc: {
		strength: 8,
		dexterity: 0,
		intelligence: -3,
		wisdom: 0,
		constitution: 0,
		attunement: 0
	},
	nimble: {
		strength: 0,
		dexterity: 2,
		intelligence: 0,
		wisdom: 0,
		constitution: -4,
		attunement: 0
	},
	nerd: {
		strength: -4,
		dexterity: -2,
		intelligence: 2,
		wisdom: 4,
		constitution: 0,
		attunement: 0
	},
	packrat: {
		strength: 0,
		dexterity: -2,
		intelligence: 2,
		wisdom: 0,
		constitution: -2,
		attunement: 5
	},
	savvy: {
		strength: 0,
		dexterity: -2,
		intelligence: 0,
		wisdom: 8,
		constitution: -5,
		attunement: 0
	}
};
const heroStatRegex = /[-\+]+([^%]+)%/;
const primaryClassString = "#primaryClassSelector option:selected";
const secondaryClassString = "#secondaryClassSelector option:selected";
function handleSwapTreeButton(event) {
	let decompressedHash = decompressHash(window.location.hash.replace("#", ""));
	let newHash = compressHash(decompressedHash.charAt(1) + decompressedHash.charAt(0) + decompressedHash.charAt(4) + decompressedHash.charAt(5) + decompressedHash.charAt(2) + decompressedHash.charAt(3) + decompressedHash.slice(27, 48) + decompressedHash.slice(6, 27) + decompressedHash.slice(48));
	let newURL = window.location.href.split("#")[0] + "#" + newHash;
	window.location.replace(newURL);
	loadFromHash(2);
	rebuildHTML();
	addHashToUndo(newHash);
}
function handleSwitchViewButton(event) {
	switch ($(this).text()) {
		default:
		case "View Hero Stats":
			if ($("#primaryClassSelector").val() != "none" || $("#secondaryClassSelector").val() != "none") {
				$("#actionSkills").addClass("hidden");
				$("#skillTrees").addClass("hidden");
				$("#heroStats").removeClass("hidden");
				$(this).text("View Skill Trees");
			}
			break;
		case "View Skill Trees":
			$("#heroStats").addClass("hidden");
			$("#actionSkills").removeClass("hidden");
			$("#skillTrees").removeClass("hidden");
			$(this).text("View Hero Stats");
			break;
	}
}
function handleScreenshotButton(event) {
	const screenshotTarget = document.body;
	$(".description, #classSelectors, #extraButtons, #footer").addClass("disabled");
	$("#summaryContainer").css({ "margin-top": "10px" });
	$("#skillSummaryContainer").css({ "padding-bottom": "10px" });
	$("#skillTrees").css({ "flex-grow": "0", "margin-bottom": "362px" });
	$("#heroStats").css({ "margin-top": "556px" });
	$("option").each(function() { $(this).html("&nbsp;" + $(this).html()); });
	$("html, body").css({ "width": "auto", "height": "auto" });
	$(".descriptionText .rainbow").removeClass("rainbow").addClass("rainbow-disabled gold");
	$(".label.rainbow").removeClass("rainbow").addClass("rainbow-disabled full");
	$(".points").css({ "height": "16px" });
	$("#actionSkills").css({ "max-width": "550px" }).removeClass("hidden");
	$("#skillTrees").removeClass("hidden");
	$("#heroStats").removeClass("hidden");
	html2canvas(screenshotTarget, {
		scrollX: 0,
		scrollY: 0,
		windowWidth: Math.min(550, window.innerWidth),
		windowHeight: $("body")[0].scrollHeight
	}).then((canvas) => {
		let newImage = new Image();
		newImage.src = canvas.toDataURL("image/png");
		let newWindow = window.open("");
		if (newWindow != null) {
			newWindow.document.write(newImage.outerHTML);
		}
		switch ($("#switchViewButton").text()) {
			default:
			case "View Hero Stats":
				$("#heroStats").addClass("hidden");
				$("#actionSkills").removeClass("hidden").removeAttr("style");
				$("#skillTrees").removeClass("hidden");
				break;
			case "View Skill Trees":
				if ($("#primaryClassSelector").val() != "none" || $("#secondaryClassSelector").val() != "none") {
					$("#actionSkills").addClass("hidden").removeAttr("style");
					$("#skillTrees").addClass("hidden");
					$("#heroStats").removeClass("hidden");
				}
				break;
		}
		$(".points").removeAttr("style");
		$(".label.rainbow-disabled").removeClass("rainbow-disabled full").addClass("rainbow");
		$(".descriptionText .rainbow-disabled").removeClass("rainbow-disabled gold").addClass("rainbow");
		$("html, body").removeAttr("style");
		$("option").each(function() { $(this).html($(this).html().replace("&nbsp;", "")); });
		$("#heroStats").removeAttr("style");
		$("#skillTrees").removeAttr("style");
		$("#skillSummaryContainer").removeAttr("style");
		$("#summaryContainer").removeAttr("style");
		$(".description, #classSelectors, #extraButtons, #footer").removeClass("disabled");
	});
}
function formatHeroStat(statValue, statMultiplier) {
	if (statValue >= 10) {
		return "+" + ((statValue - 10) * statMultiplier).toFixed(2).replace(/0{0,1}$/, "") + "%";
	} else {
		return "-" + ((10 - statValue) * statMultiplier).toFixed(2).replace(/0{0,1}$/, "") + "%";
	}
}
function getAllocatedMaxHeroPoints() {
	let allocatedHeroPoints = Number($("#strengthSlider").val()) + Number(   $("#dexteritySlider").val()) + Number($("#intelligenceSlider").val()) +
							  Number(  $("#wisdomSlider").val()) + Number($("#constitutionSlider").val()) + Number(  $("#attunementSlider").val()) - 60;
	let maxHeroPoints = Number(actualSkillPoints) + 10;
	return [allocatedHeroPoints, maxHeroPoints];
}
function handleHeroStatSlider(event, ignoreEvent) {
	let sliderValue = Number(this.value);
	if (!ignoreEvent) {
		let [allocatedHeroPoints, maxHeroPoints] = getAllocatedMaxHeroPoints();
		if (allocatedHeroPoints > maxHeroPoints) {
			let newValue = Math.max(sliderValue + maxHeroPoints - allocatedHeroPoints, 10);
			if (sliderValue != newValue) {
				$(this).val(newValue).trigger("change", allocatedHeroPoints - sliderValue + newValue > maxHeroPoints);
			}
			return false;
		}
	}
	let statName = this.id.slice(0, -6);
	let statValue = sliderValue + backstoryModifiers[$("#backstorySelector").val()][statName];
	let valueChanged = false;
	switch (statName) {
		default:
		case "strength":
			valueChanged = $("#strengthNumber").text() != statValue;
			$("#strengthNumber").text(statValue);
			$("#strengthText").text($("#strengthText").text().replace(heroStatRegex, formatHeroStat(statValue, 1.25)));
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
	if (valueChanged) {
		let [allocatedHeroPoints, maxHeroPoints] = getAllocatedMaxHeroPoints();
		$("#heroPointsText").text(allocatedHeroPoints + "/" + maxHeroPoints);
		if (!ignoreEvent) {
			saveToHash(2);
		}
	}
}
function handleBackstorySelection(event, ignoreEvent) {
	$(".heroStatSlider").trigger("change", ignoreEvent);
	if (!ignoreEvent) {
		saveToHash(2);
	}
}
function handleClassSelection(event) {
	if (this.id == "primaryClassSelector") {
		$("#primaryActionSkills .actionSkill").each(function(index, key) {
			$(this).attr("data-points", "0");
		});
		$("#primaryTree .tier").each(function(index, key) {
			$(this).attr("data-invested", "0").attr("data-total", "0");
		});
		$("#primaryTree .skill").each(function(index, key) {
			$(this).attr("data-points", "0");
		});
		saveToHash(2);
		rebuildHTML($(this).val(), ["#primaryActionSkills", "#primaryClassFeat", "#primaryTree"]);
	} else {
		$("#secondaryActionSkills .actionSkill").each(function(index, key) {
			$(this).attr("data-points", "0");
		});
		$("#secondaryTree .tier").each(function(index, key) {
			$(this).attr("data-invested", "0").attr("data-total", "0");
		});
		$("#secondaryTree .skill").each(function(index, key) {
			$(this).attr("data-points", "0");
		});
		saveToHash(2);
		rebuildHTML($(this).val(), ["#secondaryActionSkills", "#secondaryClassFeat", "#secondaryTree"]);
	}
	updateCharacterLevel();
}
function updateFeatTable() {
	if ($("#primaryClassSelector").val() == "none" && $("#secondaryClassSelector").val() == "none") {
		$("#errorMessage").text("No class selected.").removeClass("disabled");
		$("#heroStats").addClass("disabled");
		$("#featSummaryHeader").text("");
		$("#primaryClassFeat").html("").css({ "padding": "0", "width": "0" });
		$("#secondaryClassFeat").html("").css({ "padding": "0", "width": "0" });
		$("#summarySpacer").addClass("disabled");
	} else {
		$("#errorMessage").addClass("disabled");
		$("#heroStats").removeClass("disabled");
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
function rebuildHTML(_classNames, _targetElements) {
	let classNames = typeof(_classNames) != "undefined" ? [_classNames] : [$("#primaryClassSelector").val(), $("#secondaryClassSelector").val()];
	let targetElements = typeof(_targetElements) != "undefined" ? [_targetElements] : [["#primaryActionSkills", "#primaryClassFeat", "#primaryTree"], ["#secondaryActionSkills", "#secondaryClassFeat", "#secondaryTree"]];
	classNames.forEach(function(className, classIndex) {
		$.when($.get("classes/" + className + ".html")).then(function(classData) {
			$.each([".actionSkill", ".classFeat", ".skillTree"], function(elementIndex, elementKey) {
				$(targetElements[classIndex][elementIndex]).html($(classData).filter(elementKey));
			});
		}).then(finishHTML);
	});
}
function finishHTML() {
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
	updateHeroStats();
	updateFeatTable();
	handleButtonState();
	let primaryClass = $(primaryClassString);
	let secondaryClass = $(secondaryClassString);
	let multiClassName = multiClassNames[primaryClass.val() + secondaryClass.val()];
	$("#header h2").removeClass("hidden");
	if (multiClassName) {
		$("#multiClassName").text(multiClassName);
	} else {
		if (primaryClass.val() == "none") {
			if (secondaryClass.val() == "none") {
				$("#multiClassName").text("None");
				$("#header h2").addClass("hidden");
			} else {
				$("#multiClassName").text(secondaryClass.text());
			}
		} else {
			switch (secondaryClass.val()) {
				case "none":
				case primaryClass.val():
					$("#multiClassName").text(primaryClass.text());
					break;
				default:
					$("#multiClassName").text(primaryClass.text() + " / " + secondaryClass.text());
					break;
			}
		}
	}
	$("#primaryTree, #secondaryTree").removeAttr("style");
	switch (primaryClass.val()) {
		default:
		case "none":
			$("#primaryTree").css({ "margin": 0 });
			break;
		case "brrzerker":
			$("#primaryTree .colorLayer").css({ "background-color": "rgba(0, 127, 255, 0.45)" });
			break;
		case "clawbringer":
			$("#primaryTree .colorLayer").css({ "background-color": "rgba(0, 255, 255, 0.35)" });
			break;
		case "graveborn":
			$("#primaryTree .colorLayer").css({ "background-color": "rgba(255, 0, 0, 0.5)" });
			break;
		case "spellshot":
			$("#primaryTree .colorLayer").css({ "background-color": "rgba(255, 0, 255, 0.25)" });
			break;
		case "sporewarden":
			$("#primaryTree .colorLayer").css({ "background-color": "rgba(0, 255, 0, 0.45)" });
			break;
		case "stabbomancer":
			$("#primaryTree .colorLayer").css({ "background-color": "rgba(255, 127, 0, 0.65)" });
			break;
	}
	switch (secondaryClass.val()) {
		default:
		case "none":
			$("#secondaryTree").css({ "margin": 0 });
			break;
		case "brrzerker":
			$("#secondaryTree .colorLayer").css({ "background-color": "rgba(0, 127, 255, 0.45)" });
			break;
		case "clawbringer":
			$("#secondaryTree .colorLayer").css({ "background-color": "rgba(0, 255, 255, 0.35)" });
			break;
		case "graveborn":
			$("#secondaryTree .colorLayer").css({ "background-color": "rgba(255, 0, 0, 0.5)" });
			break;
		case "spellshot":
			$("#secondaryTree .colorLayer").css({ "background-color": "rgba(255, 0, 255, 0.25)" });
			break;
		case "sporewarden":
			$("#secondaryTree .colorLayer").css({ "background-color": "rgba(0, 255, 0, 0.45)" });
			break;
		case "stabbomancer":
			$("#secondaryTree .colorLayer").css({ "background-color": "rgba(255, 127, 0, 0.65)" });
			break;
	}
}
function handleDocumentInput(event) {
	switch (event.type) {
		case "click":
			if (!window.matchMedia("(any-pointer: fine)").matches && (new Date()).getTime() - mousedownBegin > 500) {
				$(".description").removeAttr("style");
			} else {
				$(".description").each(function(index, element) {
					if (!$(element).parent().is(lastTouched)) {
						$(element).removeAttr("style");
					}
				});
			}
			break;
		case "keydown":
			switch (event.keyCode) {
				case 9: // tab key
					handleButtonState();
					break;
				case 90: // z key
					if (event.ctrlKey) {
						loadPreviousHashFromUndo();
					}
					break;
			}
			break;
	}
}
function handleMouseDown(event) {
	switch (event.which) {
		case 1: // left mouse button
			window.clearTimeout(touchTimer);
			mousedownBegin = (new Date()).getTime();
			lastTouched = $(this);
			if (!window.matchMedia("(any-pointer: fine)").matches) {
				lastTouched.children(".description").css({ "display": "block" });
			}
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
			lastTouched = null;
		} else {
			updatePoints(lastTouched, 1);
		}
	}
}
function handleButtonState(event) {
	if (event && event.type == "mouseleave") {
		$(this).children().prop("disabled", false);
	} else {
		$("#swapTreeButton, #switchViewButton").prop("disabled", $("#primaryClassSelector").val() == "none" && $("#secondaryClassSelector").val() == "none");
		$("#resetButton").prop("disabled", Number($("#charLevel").text()) == 1);
		$("#screenshotButton").prop("disabled", $("#primaryClassSelector").val() == "none" || $("#secondaryClassSelector").val() == "none");
		$("#undoButton").prop("disabled", hashUndoHistory.length <= 1);
	}
}

// core skill calculator functions
function updatePoints(skillHandle, change) {
	if (skillHandle[0].classList.contains("actionSkill")) {
		$(".actionSkill").each(function() {
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
		let treeHandle = skillHandle.parent().parent();
		let thisLevel = Number(skillHandle.parent().attr("data-level"));
		let invested = Number(skillHandle.parent().attr("data-invested"));
		let tierTotal = Number(skillHandle.parent().attr("data-total"));
		let treeTotal = Number(treeHandle.parent().find(".totalPoints").text());
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
				treeHandle.children(".tier").each(function(index) {
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
		updatePassiveSkills(treeHandle);
	}
	updateStats();
	updateHeroStats();
	saveToHash(1);
}
function updateActionSkills() {
	let actionSkillNames = [];
	$(".actionSkill > .description > h2").each(function(index, element) {
		actionSkillNames[index] = $(element).text();
	});
	$(".actionSkill").each(function(index, element) {
		if ($(this).find(".icon").length == 0) {
			let className = $(element).parent().prop("id") == "primaryActionSkills" ? $("#primaryClassSelector").val() : $("#secondaryClassSelector").val();
			let imageName = actionSkillNames[index].replace(/\s+/g, "_").replace(/\W/g, "").toLowerCase();
			let imageType = $("body").hasClass("avif") ? "avif" : $("body").hasClass("webp") ? "webp" : "png";
			$(this).find(".description h2").before('<object class="icon" data="images/' + className + "/" + imageName + '.' + imageType + '" type="image/' + imageType + '"></object>');
		}
		if ($(element).children(".label").length == 0) {
			$(element).append('<div class="label">' + actionSkillNames[index] + "</div>");
		}
	});
	$(".actionSkill").each(function(_, element) {
		let p = Number($(this).attr("data-points"));
		let m = Number($(this).attr("data-max"));
		$(this).children(".points").text(p + "/" + m);
		if (p == 0) {
			$(this).removeClass("full");
			$(this).children(".label").removeClass("rainbow");
		} else {
			$(this).addClass("full");
			$(this).children(".label").addClass("rainbow");
		}
	});
}
function updatePassiveSkills(treeHandle) {
	let totalPoints = 0;
	let className = $(treeHandle).parent().parent().prop("id") == "primaryTree" ? $("#primaryClassSelector").val() : $("#secondaryClassSelector").val();
	$(treeHandle).children(".tier").each(function() {
		$(this).attr("data-invested", totalPoints); // the PREVIOUS tier running total
		let tierLevel = Number($(this).attr("data-level"));
		let tierTotal = 0;
		$(this).children(".skill:not(.hidden)").each(function() {
			let p = Number($(this).attr("data-points"));
			let m = Number($(this).attr("data-max"));
			totalPoints += p;
			tierTotal += p;
			$(this).children(".points").text(p + "/" + m);
			if (totalPoints >= 5 * tierLevel) {
				$(this).children(".points").addClass("visible");
			} else {
				$(this).children(".points").removeClass("visible");
			}
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
					let mod = Number($(this).attr("data-mod")) || 0;
					let base = Number($(this).attr("data-base"));
					let sum = Math.max(p, 1) * base + mod;
					if ($(this).attr("data-fixed")) {
						sum = sum.toFixed(1);
					} else {
						sum = sum.toFixed(0);
					}
					let plus = ($(this).attr("data-base")[0] == "+" ? "+" : "");
					$(this).text((sum > 0 ? plus : (sum == 0 ? "" : "-")) + sum + ($(this).attr("data-pct") ? "%" : ""));
				}
			});
			let skillName = $(this).find(".description h2").text();
			if ($(this).find(".icon").length == 0) {
				let imageName = skillName.replace(/\s+/g, "_").replace(/\W/g, "").toLowerCase();
				let imageType = $("body").hasClass("avif") ? "avif" : $("body").hasClass("webp") ? "webp" : "png";
				$(this).find(".description h2").before('<object class="icon" data="images/' + className + "/" + imageName + '.' + imageType + '" type="image/' + imageType + '"></object>');
			}
			if ($(this).children(".label").length == 0) {
				$(this).children(".points").after('<div class="label">' + skillName.split(" ").map((n) => n[0]).join("") + "</div>");
			}
		});
		$(this).attr("data-total", tierTotal);
	});
	$(treeHandle).parent().children(".totalPoints").text(totalPoints);
	$(treeHandle).parent().children(".colorLayer").height(Math.min(74 + totalPoints * 59.0 / 5 + (totalPoints > 25 ? 21 : 0), 369));
	$(treeHandle).parent().children(".progressLine").height($(treeHandle).parent().children(".colorLayer").height());
}
function updateCharacterLevel() {
	hasMultiClass = $(primaryClassString).val() != "none" && $(secondaryClassString).val() != "none";
	let allocatedTotal = 0;
	$(".totalPoints").each(function() {
		allocatedTotal += Number($(this).text());
	});
	internalCharLevel = allocatedTotal + 1;
	if (hasMultiClass) {
		internalCharLevel--;
	}
	if (allocatedTotal >= 20) {
		internalCharLevel--;
	}
	if (allocatedTotal >= 40) {
		internalCharLevel = allocatedTotal >= (hasMultiClass ? 44 : 43) ? (allocatedTotal - (hasMultiClass ? 4 : 3)) : 39;
	}
	actualSkillPoints = allocatedTotal;
	$("#charLevel").text(Math.max(internalCharLevel, 1));
}
function updateStats() {
	updateCharacterLevel();
	let descriptions = "";
	$(".skill").each(function() {
		let p = Number($(this).attr("data-points"));
		if (p > 0) {
			descriptions += '<div class="skillText">';
			let description = $(this).children(".description").html().replace("<h2>", "<strong>").replace("</h2>", " " + p + ":</strong>").replace(/\n|\r|\t/g, "");
			$(description).each(function(index, element) {
				if (index == 1) {
					descriptions += element.outerHTML;
				} else if (index == 2) {
					descriptions += '<div class="descriptionText">';
					element = element.innerHTML.split(["<br><br>", "<br>"]);
					element.forEach(function(childElement, childIndex) {
						if (childElement.length > 0) {
							if (childElement[childElement.length - 1] == ".") {
								childElement += " ";
							} else {
								childElement += ". ";
							}
							descriptions += childElement;
						}
					});
					descriptions += "</div>";
				}
			});
			descriptions += "</div>";
		}
	});
	$("#skillSummaryHeader").text(internalCharLevel > (hasMultiClass ? 0 : 1) ? "List of Skills" : "");
	$("#skillSummaryContainer").html(descriptions);
}
function updateHeroStats() {
	$(".heroStatSlider").sort(function (a, b) {
		let valueA = Number(a.value) + backstoryModifiers[$("#backstorySelector").val()][a.id.slice(0, -6)];
		let valueB = Number(b.value) + backstoryModifiers[$("#backstorySelector").val()][b.id.slice(0, -6)];
		return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
	}).each(function (index, slider) {
		let sliderValue = Number(slider.value);
		let [allocatedHeroPoints, maxHeroPoints] = getAllocatedMaxHeroPoints();
		if (allocatedHeroPoints > maxHeroPoints) {
			let newValue = Math.max(sliderValue + maxHeroPoints - allocatedHeroPoints, 10);
			if (sliderValue != newValue) {
				$(slider).val(newValue).trigger("change", true);
			}
		}
	});
	let [allocatedHeroPoints, maxHeroPoints] = getAllocatedMaxHeroPoints();
	$("#heroPointsText").text(allocatedHeroPoints + "/" + maxHeroPoints);
}

// url hash functions
var hashUndoHistory = [];
function saveToHash(mode) {
	let newHash = compressHash(constructHash(mode));
	let newURL = window.location.href.split("#")[0] + "#" + newHash;
	window.location.replace(newURL);
	addHashToUndo(newHash);
}
function loadFromHash(mode) {
	let curHash = decompressHash();
	// classes have 2 slots: [0, 1]
	if (mode == 0 || mode == 2) {
		$("#primaryClassSelector").prop("selectedIndex", Math.min(Number(curHash.charAt(0)), $("#primaryClassSelector option").length - 1));
		$("#secondaryClassSelector").prop("selectedIndex", Math.min(Number(curHash.charAt(1)), $("#secondaryClassSelector option").length - 1));
	}
	if (mode == 1 || mode == 2) {
		// action skills have 4 slots: [2, 3, 4, 5]
		for (let i = 0; i < 4; i++) {
			let actionSkill = i < 2 ? $("#primaryActionSkills .actionSkill")[i] : $("#secondaryActionSkills .actionSkill")[i - 2];
			if (actionSkill) {
				actionSkill.setAttribute("data-points", Math.min(Number(curHash.charAt(i + 2)), Number(actionSkill.getAttribute("data-max"))));
			}
		}
		// passive skills have 42 slots: [6 ... 47]
		for (let i = 0; i < 42; i++) {
			let skill = i < 21 ? $("#primaryTree .skill")[i] : $("#secondaryTree .skill")[i - 21];
			if (skill) {
				skill.setAttribute("data-points", Math.min(Number(curHash.charAt(i + 6)), Number(skill.getAttribute("data-max"))));
			}
		}
		// hero stats have 6 double-width slots: [48 ... 59]
		for (let i = 0; i < 6; i++) {
			$(".heroStatSlider").eq(i).val(Number(curHash.slice(48 + i * 2, 50 + i * 2)));
		}
		// hero backstory has 1 slot [60]
		$("#backstorySelector").prop("selectedIndex", Math.min(Number(curHash.charAt(60)), $("#backstorySelector option").length - 1)).trigger("change", true);
	}
}
function constructHash(mode) {
	let curHash = decompressHash();
	let newHash = "";
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
			newHash += typeof(actionSkill) === "undefined" ? 0 : Number(actionSkill.getAttribute("data-points"));
		}
		for (let i = 0; i < 42; i++) {
			let skill = i < 21 ? $("#primaryTree .skill")[i] : $("#secondaryTree .skill")[i - 21];
			newHash += typeof(skill) === "undefined" ? 0 : Number(skill.getAttribute("data-points"));
		}
		for (let i = 0; i < 6; i++) {
			newHash += ("00" + $(".heroStatSlider")[i].value).slice(-2);
		}
		newHash += $("#backstorySelector option:selected")[0].index;
	}
	if ((newHash.length) < 3) {
		return "";
	}
	return newHash;
}
function addHashToUndo(curHash) {
	if (hashUndoHistory[hashUndoHistory.length - 1] != curHash && hashUndoHistory.push(curHash) > 100) {
		hashUndoHistory.shift();
	}
}
function loadPreviousHashFromUndo() {
	if (hashUndoHistory.length > 1) {
		let newHash = hashUndoHistory[hashUndoHistory.length - 2];
		let newURL = window.location.href.split("#")[0] + "#" + newHash;
		window.location.replace(newURL);
		loadFromHash(2);
		rebuildHTML();
		hashUndoHistory.pop();
	}
}
function handleResetButton() {
	let newHash = compressHash($("#primaryClassSelector").prop("selectedIndex").toString() + $("#secondaryClassSelector").prop("selectedIndex").toString());
	addHashToUndo(window.location.hash.replace("#", ""));
	window.location.hash = newHash;
	loadFromHash(2);
	rebuildHTML();
	addHashToUndo(newHash);
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
$(document).ready(function() {
	$(document).on("click keydown", handleDocumentInput);
	$("#swapTreeButton").on("click", handleSwapTreeButton);
	$("#resetButton").on("click", handleResetButton);
	$("#switchViewButton").on("click", handleSwitchViewButton);
	$("#screenshotButton").on("click", handleScreenshotButton);
	$("#undoButton").on("click", loadPreviousHashFromUndo);
	$("#classSelectors, #extraButtons").on("keydown mouseenter mouseleave", handleButtonState);
	$(".heroStatSlider").on("change", handleHeroStatSlider);
	$("#backstorySelector").on("change", handleBackstorySelection);
	$("#primaryClassSelector").on("change", handleClassSelection);
	$("#secondaryClassSelector").on("change", handleClassSelection);
	loadFromHash(2);
	rebuildHTML();
	addHashToUndo(window.location.hash.replace("#", ""));
});