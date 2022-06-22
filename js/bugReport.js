
function sendBugReport() {
    let title = document.getElementById("bug-report-title").value;
    let description = document.getElementById("bug-report-description").value;
    let email = document.getElementById("bug-report-email").value;


    if (title != null && description != null && email != null) {
        let bugReport = {
                "bugReportTitle" : title,
                "bugReportMessage" : description,
                "contactEmail" : email
        }

        fetch(backendurl + "/bugreport" , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bugReport)
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            alert(data.response);
        })
        .catch(error => {
            alert('Er is iets fouts gegaan');
        });

    } 
}


function openPage(divId) {
    window.location = "../html/userPage.html";
}

function openPage(divId) {
    if (divId == "MijnOverzicht")
        localStorage.setItem("currentTab", 0);
    else if (divId == "Boekenlijst")
        localStorage.setItem("currentTab", 1);
    else
        localStorage.setItem("currentTab", 2); 
    window.location = "../html/userPage.html";
}
