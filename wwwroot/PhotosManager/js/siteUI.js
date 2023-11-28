let contentScrollPosition = 0;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Views rendering
function showWaitingGif() {
    eraseContent();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='images/Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
<<<<<<< Updated upstream
function updateHeader() {
    //todo
=======


function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}
async function createProfil(profil) {
    let user = await API.register(profil);
    if (user !== null) {
        renderLoginForm("Votre compte a été créé. Veuillez prende vos courriels pour récupérer votre code de vérification qui vous sera demandé lors de votre prochaine connexion.");
    }
}

async function login(Email, Password) {
    let result = await API.login(Email, Password);
    console.log(API.currentStatus);
    if (!result) {
        if (API.currentStatus == 481) {
            renderLoginForm("", "Courriel Introuvable", "");
            return false;
        }

        if (API.currentStatus == 482) {
            renderLoginForm("", "", "Mot de passe incorrect");
            return false;
        }
        else {
            renderError();
            return false;

        }
    }
    else {
        verifyLoggedUser();
        return true;
    }
}





async function verifyLoggedUser() {
    console.log(user.VerifyCode);
    if (user.VerifyCode == "unverified") {
        renderVerify(user.Id, "");
    }
    else {
        renderPhotoManager();
    }

}

async function verifyCode(code) {
    let result = await API.verifyEmail(user.Id, code);
    if (result) {
        renderPhotoManager();
    }
    else {
        renderVerify();
    }

}
function renderPhotoManager() {
    console.log("Fully logged in")
    updateHeader("Liste des photos", "photoManager");
}
function renderVerify() {
    eraseContent();
    updateHeader("Vérification", "verify");
    $("#content").append(`<div class="content" style="text-align:center">
    <b>Veuillez entrer le code de vérification de que vous avez reçu par courriel</b>

    <form class="form" id="verifyForm">
    <input type='text'
    id="verifyCode"
    name='VerifyCode'
    class="form-control"
    required
    RequireMessage = 'Veuillez entrer le code'
    InvalidMessage = 'Code invalide'
    placeholder="Code de vérification de courriel">
    <span style='color:red'></span>
    </form>
    <button class="form-control btn-primary" id="verifyCmd">Vérifier</button>
    </div>
    </div>
    `);
    $('#verifyCmd').on("click", function (event) {
        let code = $("#verifyCode").val();
        event.preventDefault();
        verifyCode(code)
    });
}

function renderError() {
    eraseContent();
    updateHeader("Problème", "error");
    $("#content").append(`<div class="content" style="text-align:center">
    <h2 style='color:red'><b>Le serveur ne répond pas</b></h2>
    <hr>
    <form class="form" id="errorForm">
    <button class="form-control btn-info" id="connexionCmd">Connexion</button>
    </form>
    </div>
    </div>`);
    $('#connexionCmd').on("click", function () {
        renderLoginForm();
    });
}


// API user.JS
async function renderLoginForm(message = "", emailError = "", pwdError = "") {
    if (user != null) {
        await API.logout();
    }
    eraseContent();
    updateHeader("Connexion", "login");
    console.log(message);
    let loginMessage = message;
    let Email = "";
    let EmailError = emailError;
    let passwordError = pwdError;
    $("#content").append(`<div class="content" style="text-align:center">
    <h3>${loginMessage}</h3>
    <form class="form" id="loginForm">
    <input type='email'
    id="emailLogin"
    name='Email'
    class="form-control"
    required
    RequireMessage = 'Veuillez entrer votre courriel'
    InvalidMessage = 'Courriel invalide'
    placeholder="adresse de courriel"
    value='${Email}'>
    <span style='color:red'>${EmailError}</span>
    <input type='password'
    id="passwordLogin"
    name='Password'
    placeholder='Mot de passe'
    class="form-control"
    required
    RequireMessage = 'Veuillez entrer votre mot de passe'>
    <span style='color:red'>${passwordError}</span>
    <input type='submit' name='submit' value="Entrer" class="form-control btn-primary">
    </form>
    <div class="form">
    <hr>
    <button class="form-control btn-info" id="createProfilCmd">Nouveau compte</button>
    </div>
    </div>`);
    $('#createProfilCmd').on("click", async function () {
        renderCreateProfil();
    });
    $('#loginForm').on("submit", async function (event) {
        let Email = $("#emailLogin").val();
        let Password = $("#passwordLogin").val();
        login(Email, Password);
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission 
    });
}


function renderCreateProfil() {
    noTimeout(); // ne pas limiter le temps d’inactivité
    eraseContent(); // effacer le conteneur #content
    updateHeader("Inscription", "createProfil"); // mettre à jour l’entête et menu
    $("#newPhotoCmd").hide(); // camouffler l’icone de commande d’ajout de photo
    $("#content").append(`
    <form class="form" id="createProfilForm"'>
    <fieldset>
    <legend>Adresse ce courriel</legend>
    <input type="email"
    class="form-control Email"
    name="Email"
    id="Email"
    placeholder="Courriel"
    required
    RequireMessage = 'Veuillez entrer votre courriel'
    InvalidMessage = 'Courriel invalide'
    CustomErrorMessage ="Ce courriel est déjà utilisé"/>
    <input class="form-control MatchedInput"
    type="text"
    matchedInputId="Email"
    name="matchedEmail"
    id="matchedEmail"
    placeholder="Vérification"
    required
    RequireMessage = 'Veuillez entrez de nouveau votre courriel'
    InvalidMessage="Les courriels ne correspondent pas" />
    </fieldset>
    <fieldset>
    <legend>Mot de passe</legend>
    <input type="password"
    class="form-control"
    name="Password"
    id="Password"
    placeholder="Mot de passe"
    required
    RequireMessage = 'Veuillez entrer un mot de passe'
    InvalidMessage = 'Mot de passe trop court'/>
    <input class="form-control MatchedInput"
    type="password"
    matchedInputId="Password"
    name="matchedPassword"
    id="matchedPassword"
    placeholder="Vérification" required
    InvalidMessage="Ne correspond pas au mot de passe" />
    </fieldset>
    <fieldset>
    <legend>Nom</legend>
    <input type="text"
    class="form-control Alpha"
    name="Name"
    id="Name"
    placeholder="Nom"
    required
    RequireMessage = 'Veuillez entrer votre nom'
    InvalidMessage = 'Nom invalide'/>
    </fieldset>
    <fieldset>
    <legend>Avatar</legend>
    <div class='imageUploader'
    newImage='true'
    controlId='Avatar'
    imageSrc='images/no-avatar.png'
    waitingImage="images/Loading_icon.gif">
    </div>
    </fieldset>
    <input type='submit' name='submit' id='saveUserCmd' value="Enregistrer" class="form-control btn-primary">
    </form>
    <div class="cancel">
    <button class="form-control btn-secondary" id="abortCmd">Annuler</button>
    </div>
    `);
    $('#loginCmd').on('click', renderLoginForm)// call back sur clic
    initFormValidation();
    initImageUploaders();
    $('#abortCmd').on('click', function () {
        renderLoginForm("", "", "");
    }); // call back sur clic
    // ajouter le mécanisme de vérification de doublon de courriel
    addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    // call back la soumission du formulaire
    $('#createProfilForm').on("submit", async function (event) {
        let profil = getFormData($('#createProfilForm'));
        delete profil.matchedPassword;
        delete profil.matchedEmail;
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
        showWaitingGif(); // afficher GIF d’attente
        createProfil(profil); // commander la création au service API
    });
}

function renderModifyProfil()
{
    noTimeout(); // ne pas limiter le temps d’inactivité
    eraseContent(); // effacer le conteneur #content
    updateHeader("Modifier votre profil", "modifierProfil"); // mettre à jour l’entête et menu
    
}

function updateHeader(title, type) {
    eraseHeader();
    if (type == "about" || type == "login" || type == "createProfil" || type == "error" || type == "verify") {
        $('#header').append($(`
        <img id='photoTitleContainer' src='./favicon.ico' /><h2>${title}</h2>
    
        <div class="dropdown ms-auto">
        <div data-bs-toggle="dropdown" aria-expanded="false">
            <i class="cmdIcon fa fa-ellipsis-vertical"></i>
        </div>
        <div class="dropdown-menu noselect">
            <div class="dropdown-item" id="loginCmd">
                <i class="menuIcon fa fa-sign-in mx-2"></i> Connexion
            </div>
            <div class="dropdown-divider"></div>
    
            <div class="dropdown-item" id="aboutCmd">
                <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
            </div>
        </div>
    </div>`
        ))
        $('#loginCmd').on("click", function () {
            renderLoginForm();
        });
        $('#aboutCmd').on("click", function () {
            renderAbout();
        });
    }
    else if(type=="photoManager" || type =="modifierProfil")
    {
        $('#header').append($(`
        <img id='photoTitleContainer' src='./favicon.ico' /><h2>${title}</h2>
    
        <div class="dropdown ms-auto">
        <div data-bs-toggle="dropdown" aria-expanded="false">
            <i class="cmdIcon fa fa-ellipsis-vertical"></i>
        </div>
        <div class="dropdown-menu noselect">
            <div class="dropdown-item" id="logoutCmd">
                <i class="menuIcon fa fa-sign-in mx-2"></i> Déconnexion
            </div>
            <div class="dropdown-item" id="editProfilMenuCmd">
                <i class="menuIcon fa fa-user-edit mx-2"></i> Modifier votre profil
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" id="listPhotosMenuCmd">
                <i class="menuIcon fa fa-image mx-2"></i> Liste des photos
            </div>
            <div class="dropdown-divider"></div>
            <span class="dropdown-item" id="sortByDateCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-calendar mx-2"></i>
                 Photos par date de création
            </span>
            <span class="dropdown-item" id="sortByOwnersCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-users mx-2"></i>
                Photos par créateur
            </span>
            <span class="dropdown-item" id="sortByLikesCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa-solid fa-heart"></i>
                Photos les plus aimées
            </span>
            <span class="dropdown-item" id="ownerOnlyCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-user mx-2"></i>
                Mes photos
            </span>
            <div class="dropdown-item" id="aboutCmd">
                <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
            </div>
        </div>
    </div>
       `
        ))
        $('#logoutCmd').on("click", function () {
            renderLoginForm();
        });
        $('#editProfilMenuCmd').on("click", function () {
            renderLoginForm();
        });
        $('#listPhotosMenuCmd').on("click", function () {
            renderLoginForm();
        });
        $('#sortByDateCmd').on("click", function () {
            renderLoginForm();
        });
        $('#sortByOwnersCmd').on("click", function () {
            renderLoginForm();
        });
        $('#sortByLikesCmd').on("click", function () {
            renderLoginForm();
        });
        $('#ownerOnlyCmd').on("click", function () {
            renderLoginForm();
        });
        $('#aboutCmd').on("click", function () {
            renderAbout();
        });
    }
    else if(type=="photoManagerAdmin")
    {
        $('#header').append($(`
        <img id='photoTitleContainer' src='./favicon.ico' /><h2>${title}</h2>
    
        <div class="dropdown ms-auto">
        <div data-bs-toggle="dropdown" aria-expanded="false">
            <i class="cmdIcon fa fa-ellipsis-vertical"></i>
        </div>
        <div class="dropdown-menu noselect">

            <div class="dropdown-item" id="manageUserCm">
                <i class="menuIcon fas fa-user-cog mx-2"></i> Gestion des usagers
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" id="logoutCmd">
                <i class="menuIcon fa fa-sign-in mx-2"></i> Déconnexion
            </div>
            <div class="dropdown-item" id="editProfilMenuCmd">
                <i class="menuIcon fa fa-user-edit mx-2"></i> Modifier votre profil
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" id="listPhotosMenuCmd">
                <i class="menuIcon fa fa-image mx-2"></i> Liste des photos
            </div>
            <div class="dropdown-divider"></div>
            <span class="dropdown-item" id="sortByDateCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-calendar mx-2"></i>
                 Photos par date de création
            </span>
            <span class="dropdown-item" id="sortByOwnersCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-users mx-2"></i>
                Photos par créateur
            </span>
            <span class="dropdown-item" id="sortByLikesCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa-solid fa-heart"></i>
                Photos les plus aimées
            </span>
            <span class="dropdown-item" id="ownerOnlyCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-user mx-2"></i>
                Mes photos
            </span>
            <div class="dropdown-item" id="aboutCmd">
                <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
            </div>
        </div>
    </div>
       `
        ))
        $('#manageUserCm').on("click", function () {
            renderLoginForm();
        });
        $('#logoutCmd').on("click", function () {
            renderLoginForm();
        });
        $('#editProfilMenuCmd').on("click", function () {
            renderLoginForm();
        });
        $('#listPhotosMenuCmd').on("click", function () {
            renderLoginForm();
        });
        $('#sortByDateCmd').on("click", function () {
            renderLoginForm();
        });
        $('#sortByOwnersCmd').on("click", function () {
            renderLoginForm();
        });
        $('#sortByLikesCmd').on("click", function () {
            renderLoginForm();
        });
        $('#ownerOnlyCmd').on("click", function () {
            renderLoginForm();
        });
        $('#aboutCmd').on("click", function () {
            renderAbout();
        });
    }
>>>>>>> Stashed changes
}
function renderAbout() {
    timeout();
    saveContentScrollPosition();
    eraseContent();
    UpdateHeader("À propos...", "about");

    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de photos</h2>
                <hr>
                <p>
                    Petite application de gestion de photos multiusagers à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
