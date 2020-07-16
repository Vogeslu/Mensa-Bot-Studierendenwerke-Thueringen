let request = require("request-promise"),
    cheerio = require("cheerio"),
    iconv   = require("iconv-lite");

let canteens = {
    "eisenach-wartenberg": {name:"Eisenach: Am Wartenberg",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/eisenach/mensa-am-wartenberg-2.html",plans:{}},
    "erfurt-nordhaueser": {name:"Erfurt: Nordhäuser Straße",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/erfurt/mensa-nordhaeuser-strasse.html",plans:{}},
    "erfurt-altonaer": {name:"Erfurt: Altonaer Straße",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/erfurt/mensa-altonaer-strasse.html",plans:{}},
    "gera-freundschaft": {name:"Gera: Weg der Freundschaft",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/gera/mensa-weg-der-freundschaft.html",plans:{}},
    "illmenau-ehrenberg": {name:"Illmenau: Ehrenberg",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/ilmenau/mensa-ehrenberg.html",plans:{}},
    "jena-carl-zeiss": {name:"Jena: Carl-Zeiss-Promenade",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/jena/mensa-carl-zeiss-promenade.html",plans:{}},
    "jena-ernst-abbe": {name:"Jena: Ernst-Abbe-Platz",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/jena/mensa-ernst-abbe-platz.html",plans:{}},
    "jena-philosophenweg": {name:"Jena: Philosophenweg",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/jena/mensa-ernst-abbe-platz.html",plans:{}},
    "nordhausen-weinberghof": {name:"Nordhausen: Weinberghof",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/nordhausen/mensa-nordhausen.html",plans:{}},
    "schmalkalden-blechhammer": {name:"Schmalkalden: Blechhammer",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/schmalkalden/mensa-schmalkalden.html",plans:{}},
    "weimar-park": {name:"Weimar: Am Park",url:"https://www.stw-thueringen.de/deutsch/mensen/einrichtungen/weimar/mensa-am-park.html",plans:{}}
}

let contents = {
    "1": {
        name: "mit Farbstoff"
    },
    "2": {
        name: "mit Konservierungsstoff"
    },
    "3": {
        name: "mit Antioxidationsmittel"
    },
    "4": {
        name: "mit Geschmachtsverstärker"
    },
    "5": {
        name: "geschwefelt"
    },
    "6": {
        name: "geschwärzt"
    },
    "7": {
        name: "gewachst"
    },
    "8": {
        name: "mit Phosphat"
    },
    "9": {
        name: "mit Süßungsmittel"
    },
    "10": {
        name: "enthält eine Phenylalaninquelle"
    },
    "13": {
        name: "kann die Aktivität und Aufmerksamkeit von Kindern beeinträchtigen"
    },
    "14": {
        name: "mit kakaohaltiger Fettglasur"
    },
    "15": {
        name: "koffeinhaltig"
    },
    "16": {
        name: "chininhaltig"
    },
    "Gl": {
        name: "enthält Gluten"
    },
    "Wz": {
        name: "enthält Weizen"
    },
    "Ro": {
        name: "enthält Roggen"
    },
    "Gs": {
        name: "enthält Gerste"
    },
    "Hf": {
        name: "enthält Hafer"
    },
    "Di": {
        name: "enthält Dinkel"
    },
    "Ka": {
        name: "enthält Kamut (Khorasan-Weizen)"
    },
    "Er": {
        name: "enthält Erdnüsse",
        icon: "🥜"
    },
    "Nu": {
        name: "enthält Schalenfrüchte"
    },
    "Ma": {
        name: "enthält Mandeln"
    },
    "Ha": {
        name: "enthält Haselnüsse"
    },
    "Wa": {
        name: "enthält Walnüsse"
    },
    "Ca": {
        name: "enthält Cashewnüsse"
    },
    "Pe": {
        name: "enthält Pekannüsse"
    },
    "Pa": {
        name: "enthält Paranüsse"
    },
    "Pi": {
        name: "enthält Pistazien"
    },
    "Mc": {
        name: "enthält Macadamianüsse"
    },
    "Kr": {
        name: "enthält Krebstiere",
        icon: "🦀"
    },
    "Ei": {
        name: "enthält Hühnerei",
        icon: "🥚"
    },
    "Fi": {
        name: "enthält Fisch",
        icon: "🐟"
    },
    "So": {
        name: "enthält Soja"
    },
    "Mi": {
        name: "enthält Milch- und Milchzucker",
        icon: "🥛"
    },
    "Sel": {
        name: "enthält Sellerie"
    },
    "Sen": {
        name: "enthält Senf"
    },
    "Ses": {
        name: "enthält Sesam"
    },
    "Su": {
        name: "enthält Schwefeloxid/Sulfite"
    },
    "Lu": {
        name: "enthält Lupine"
    },
    "We": {
        name: "enthält Weichtiere"
    },
    "A": {
        name: "enthält Alkohol",
        icon: "🍺"
    },
    "F": {
        name: "Fisch",
        icon: "🐟"
    },
    "G": {
        name: "Geflügel",
        icon: "🐓"
    },
    "K": {
        name: "Knoblauch"
    },
    "L": {
        name: "Lammfleisch",
        icon: "🐑"
    },
    "R": {
        name: "Rindfleisch",
        icon: "🐄"
    },
    "S": {
        name: "Schweinefleisch",
        icon: "🐖"
    },
    "W": {
        name: "Wildfleisch"
    },
    "T1": {
        name: "enthält tierische Gelatine"
    },
    "T2": {
        name: "enthält tierisches Lab"
    },
    "T3": {
        name: "enthält echtes Karmin"
    },
    "T4": {
        name: "enthält Sepia"
    },
    "T5": {
        name: "enthält Honig",
        icon: "🍯"
    },
    "V": {
        name: "Vegetarisch",
        icon: "🍃"
    },
    "V*": {
        name: "Vegan",
        icon: "🌱"
    }
}

function parseDate(input) {
    var parts = input.match(/(\d+)/g);
    return new Date(parts[2], parts[1]-1, parts[0]);
}

Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
  }

async function getCurrentWeek(canteen, skipCache=false) {
    var date = new Date();
    var week = date.getFullYear()+"-"+date.getWeek();

    return await getPlan(canteen, week, skipCache)
}

async function getNextWeek(canteen, skipCache=false) {
    var date = new Date();
    var weekValue = parseInt(date.getWeek());
    var week = weekValue===52?((date.getFullYear()+1)+"-"+(weekValue+1)):(date.getFullYear()+"-"+(weekValue+1));

    return await getPlan(canteen, week, skipCache)
}

async function getToday(canteen, skipCache=false) {
    var data = await getCurrentWeek(canteen,skipCache);
    if(data == null) return null;

    for(let i = 0; i < data.length; i++) {
        let day = data[i];
        if((new Date(day.currentDate.date)).getDate() === (new Date()).getDate())
            return day;
    }

    return null;
}

async function getDetails(canteen,skipCache=false) {
    if(typeof canteens[canteen] === "undefined") return null;

    if(!skipCache && typeof canteens[canteen].details !== "undefined" && canteens[canteen].details.cacheExpires > Date.now())
        return canteens[canteen].details.data;

    let content = iconv.decode(await request(
        {
            method:"POST",
            uri:canteens[canteen].url,
            headers: { 
                'Content-Type': 'content=text/html; charset=iso-8859-1'
            },
            encoding:null
        }),"iso-8859-1");

    const $ = cheerio.load(content);

    if($("#wohneninhalt ul").length === 0)
        return null;
    else {
        var output = {
            identifier: canteen,
            name: $("#headline1 h1").text().trim(),
            url: canteens[canteen],
            data: []
        };

        $("#wohneninhalt ul").each(function() {
            var data = {};

            data.title = $(this).find("li").eq(0).text();

            var details = $(this).find("li").eq(1),
                detailsList = [];

            details.find("p").each(function() {
                if(!$(this).html().startsWith("<!--")) {
                    $(this).find("br").replaceWith("\n")
                    detailsList.push($(this).text().trim());
                }
            });

            data.details = detailsList.join("\n");

            output.data.push(data);
        });

        canteens[canteen].details = {
            cacheExpires: Date.now()+(1000*60*60*2),
            data: output
        }

        return output;
    }
}

async function getPlan(canteen, week, skipCache=false) {
    if(typeof canteens[canteen] === "undefined") return null;

    if(!skipCache && typeof canteens[canteen].plans[week] !== "undefined" && canteens[canteen].plans[week].cacheExpires > Date.now())
        return canteens[canteen].plans[week].data;

    let content = iconv.decode(await request(
        {
            method:"POST",
            uri:canteens[canteen].url,
            headers: { 
                'Content-Type': 'content=text/html; charset=iso-8859-1'
            },
            form:{"selWeek":week,"selView":"liste"},
            encoding:null
        }),"iso-8859-1");

    const $ = cheerio.load(content);

    if($("#accordion1 form table").length === 0)
        return null;
    else {
        var output = [];
        var currentDate = null;
        var currentEntry = {};
        for(let i = 0; i < $("#accordion1 form table").parent().children().length; i++) {
            var child = $("#accordion1 form table").parent().children().eq(i);
            if(child.is("div")) {
                currentDate = {
                    text: child.text(),
                    date: parseDate(child.text().split(", ")[1])
                }

                currentEntry.currentDate = currentDate; 
            }
            if(child.is("table") && currentDate != null) {
                currentEntry.list = [];
                for(let j = 0; j < child.find("tbody").children().length; j++) {
                    var entry = child.find("tbody").children().eq(j);
                    if(entry.attr("style").indexOf("display:none") === -1) {
                        var details = entry.find("td").eq(1);
                        details.find("img").replaceWith("")
                        details.find("br").replaceWith("")
                        var foodDetails = details.text().replace(/(\r\n|\n|\r)/gm, "").trim().split("	");
                        currentEntry.list.push({
                            title: entry.find("td").eq(0).text(),
                            food: foodDetails[0].trim(),
                            contents: {
                                list: foodDetails[foodDetails.length-1].trim().replace("Inhalt: ",""),
                                detailed: getMatchingContents(foodDetails[foodDetails.length-1].trim().replace("Inhalt: ",""))
                            },
                            price: entry.find("td").eq(2).text().trim()
                        });
                    }
                }

                output.push(currentEntry);
                currentDate = null;
                currentEntry = {};
            }
        }

        canteens[canteen].plans[week] = {
            cacheExpires: Date.now()+(1000*60*60*2),
            data: output
        }

        return output;
    }

    function getMatchingContents(data) {
        let output = [];
        data.split(",").forEach((content)=>{
            if(typeof contents[content] !== "undefined") {
                var data = contents[content];
                data.short = content;
                output.push(data);
            } else
                output.push({name:content,short:content});
        });

        return output;
    }
}

module.exports = {
    getCurrentWeek,
    getNextWeek,
    getPlan,
    getDetails,
    getToday,
    canteens,
    contents
}