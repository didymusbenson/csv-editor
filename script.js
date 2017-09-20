if (window.location.search.indexOf('?css=fun') === 0) {
    document.write('<link rel="stylesheet" href="./fun.css" />');
} else {
    document.write('<link rel="stylesheet" href="./default.css" />');
}
var file;
var spaces;
var file_name;
var template = Handlebars.compile(document.querySelector('#template').innerHTML);
document.querySelector('input').addEventListener('change', getFile)

//        function addAce(ele) {
//            console.log(ele);
//            var editor = ace.edit(ele);
//            editor.setTheme("ace/theme/iplastic");
//            editor.getSession().setMode("ace/mode/html");
//        }

function getBlank() {
    return {
        skill: "",
        level: "",
        questionname: "",
        function: "",
        topic: "",
        difficultylevel: "",
        passagetext: "",
        questiontext: "",
        answertext1: "",
        answertext2: "",
        answertext3: "",
        answertext4: "",
        answertext5: "",
        answertext6: ""
    };
}

function addAceEditor(stringIn, index) {
    return '<div class="editor" id="editor' + (index + 1) + '" ><textarea>' + stringIn + '</textarea></div>';
}

function addTinyMCE() {

    tinymce.init({
        selector: 'textarea',
        height: 300,
        width: '100%',
        menubar: false,
        plugins: [
                    'advlist autolink lists link image charmap print preview anchor textcolor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table contextmenu paste definitionlist code help'
                ],
        toolbar: 'insert | undo redo |  styleselect | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | ToggleDefinitionList ToggleDefinitionItem | code | help',
        convert_urls: false,
        init_instance_callback: function (editor) {
            editor.on('KeyUp', function (e) {
                //console.log(editor.getContent(), this.id);
                var textarea = document.querySelector("#" + this.id)
                textarea.dataset.editortext = (editor.getContent({
                    format: 'raw'
                }));
                saveData(textarea);
                //console.log(textarea.dataset.editortext);

            });
        }
    });
}

function makeUI(data) {
    console.log(data)
    file = data;
    console.log(file);
    document.querySelector('#UI').innerHTML = template(data);

    //add ace
    //Array.from(document.querySelectorAll('textarea')).forEach(addAce)
    function addAce() {

        var needsAce = document.getElementsByTagName("textarea");

        for (var i = 0; i < needsAce.length; i++) {
            needsAce[i].outerHTML = addAceEditor(needsAce[i].innerHTML, i);
        }
        renderAceEditor();
    }

    //addAce();
    addTinyMCE();

    addListeners();

    var add_another = document.createElement('div');
    add_another.addEventListener('click', function (event) {
        add_row();
    }, false);

    add_another.classList.add("new_row");
    add_another.innerHTML = "<p class='plus'>+</p><p> add another question</p>";
    document.querySelector("#UI").appendChild(add_another);
}

// Finds out what the last row in the UI is and then adds another row to the end.
function add_row() {
    //            var new_row = document.createElement('div');
    var ui = document.querySelector("#UI");
    var divs = document.querySelectorAll('#UI > div');
    var index = parseInt(divs[divs.length - 2].id.split("row")[1]);
    index++;

    //TODO: function that g
    var new_rows = template([getBlank()]);
    var parser = new DOMParser();
    new_rows = parser.parseFromString(new_rows, "text/html").querySelector("#row0");
    //            console.log(new_rows);
    new_rows.id = "row" + index;

    ui.insertBefore(new_rows, divs[divs.length - 1]);
    fixNewRow(new_rows.id);
}

function addListeners() {
    //add change event listener to inputs
    var inputs = document.getElementsByTagName("input");

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('keyup', function (event) {
            saveData(this);
        }, false);
    }

    //add change event listener to editors
    var editors = document.querySelectorAll("textarea");
    for (var i = 0; i < editors.length; i++) {
        editors[i].addEventListener('keyup', function (event) {
            saveData(this);
        }, false);
    }

}

function fixNewRow(id) {
    var row = document.querySelector("#" + id);
    var inputs = row.getElementsByTagName("input");

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('keyup', function (event) {
            saveData(this);
        }, false);
    }
    addTinyMCE();
    //add change event listener to editors
    var editors = row.querySelectorAll("textarea");

    for (var i = 0; i < editors.length; i++) {
        editors[i].addEventListener('keyup', function (event) {
            saveData(this);
        }, false);
    }
}


function renderAceEditor() {
    $('.editor').each(function (index, element) {
        // Make the document object to count the lines


        var editor = ace.edit(element);

        editor.setTheme("ace/theme/chrome");

        editor.setAutoScrollEditorIntoView(true);
        editor.setOptions({
            fontFamily: "monospace",
            fontSize: "16px",
            // Only display 30 lines, if result is longer than 30 lines
            minLines: 10
        })
        editor.getSession().setMode("ace/mode/html");
    });
}


function getFile() {
    var file = this.files[0]
    var reader = new FileReader();
    reader.onload = function (e) {
        var fileData = e.target.result;

        //need to fix the spaces in the obj props
        makeUI(d3.csvParse(fileData).map(function (item) {
            spaces = Object.keys(item);
            return Object.keys(item).reduce(function (objOut, key) {
                objOut[key.replace(/ /g, '')] = item[key];
                return objOut;
            }, {});
        }));
        file_name = document.querySelector("#file").value;
        //This should work the first time but it doesn't
        file_name = file_name.split("fakepath")[1].replace("\\", "");
    };
    reader.readAsText(file);

}

function saveData(element) {
    // Get which row of the CSV to change
    var row = parseInt(element.parentElement.parentElement.parentElement.id.split("row")[1]);
    console.log(row);
    var columnName = element.previousElementSibling.innerHTML.replace(' ', '');
    // Adds a new row to the file data if it doesn't exist yet.
    if (!file[row]) {
        console.log("this is a new row, the last row is:", file[row - 1]);
        file.push(getBlank());
        console.log(file[row]);
    }

    //            console.log(row, columnName);
    //            console.log(file[row][columnName]);
    if (element.tagName == "TEXTAREA") {
        // DO IT TWICE, BECAUSE MCE
        var columnName = element.previousElementSibling.previousElementSibling.innerHTML.replace(' ', '');
        //console.log(element.dataset.editortext);
        //console.log(file[row][columnName]);
        file[row][columnName] = element.dataset.editortext;
        //console.log(file[row][columnName]);
    } else {
        var columnName = element.previousElementSibling.innerHTML.replace(' ', '');
        file[row][columnName] = element.value;
        // console.log(file[row][columnName])
    }

    //            console.log(file[row][columnName]);
}


function downloadit() {
    var exported = d3.csvFormat(file);
    download(exported, file_name, "text/plain");
}
