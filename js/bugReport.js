
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
            alert("Verzonden!");
        })
        .catch(error => {
            alert('Er is iets fouts gegaan');
        });

    } 
}


function openPage(divId) {
    window.location = "../html/userPage.html";
}