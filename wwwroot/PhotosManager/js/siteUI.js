


let contentScrollPosition = 0;
Init_UI();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Views rendering
let loggedUserId = 0;
async function Init_UI() {
    renderLoginForm("", "", "");
    initTimeout(200,renderLoginForm); //
    /*
    if (user == null) {
        renderLoginForm();
    }
    else {
        verifyLoggedUser();
    }
    /*
    let user = await API.retrieveLoggedUser();
    if (user) {
        verifyLoggedUser();
    }
    else {
        renderLoginForm();
    }
    */
}

function showWaitingGif() {
    eraseContent();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='images/Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function eraseHeader() {
    $("#header").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}


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
    let user = await API.retrieveLoggedUser();
    console.log(user.VerifyCode);
    console.log(user.Authorizations);

    if (user !== null) {
        if (user.Authorizations.writeAccess == 0 && user.Authorizations.writeAccess == 0) {
            API.logout();
            renderLoginForm("Votre compte est bloqué!");
        }
        else if (user.VerifyCode == "verified") {
            renderPhotoManager();
        }
        else {
            renderVerify("");
        }
    }
}

async function verifyCode(code) {
    let userId = API.retrieveLoggedUser().Id;
    if (await API.verifyEmail(userId, code)) {
        renderPhotoManager();
    }
    else {
        renderVerify("Code invalide!");
    }
}
function renderPhotoManager() {
    timeout();
    let user = API.retrieveLoggedUser();

    if (user.Authorizations.readAccess == 2 && user.Authorizations.writeAccess == 2) {
        updateHeader("Liste des photos", "photoManagerAdmin", user);

    }
    else {
        updateHeader("Liste des photos", "photoManager", user);
    }

    eraseContent();
    $("#content").append("<h3>En construction...</h3>")

}
function renderVerify(message = "") {
    timeout(); //
    let messageError = message;
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
    <span style='color:red'>${messageError}</span>
    <button class="form-control btn-primary"  style="margin-top:25px" id="verifyCmd">Vérifier</button>
    </form>
    </div>
    </div>`);
    initFormValidation();
    initImageUploaders();
    $('#verifyCmd').on("click", function (event) {
        let code = getFormData($("#verifyForm"));
        event.preventDefault();
        showWaitingGif();
        verifyCode(code.VerifyCode);
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
async function renderModify() {
    timeout(); //
    let user = await API.retrieveLoggedUser();
    updateHeader("Profil", "modifierProfil", user);
    eraseContent();
    $("#content").append(`
    <form class="form" id="createProfilForm"'>
    <input type="hidden" name="Id" id="Id" value="${user.Id}"/>
    <fieldset>
    <legend>Adresse ce courriel</legend>
    <input type="email"
    class="form-control Email"
    name="Email"
    value='${user.Email}'
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
    value='${user.Email}'
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
    value='${user.Name}'
    id="Name"
    placeholder="Nom"
    required
    RequireMessage = 'Veuillez entrer votre nom'
    InvalidMessage = 'Nom invalide'/>
    </fieldset>
    <fieldset>
    <legend>Avatar</legend>
    <div class='imageUploader'
    newImage='false'
    controlId='Avatar'
    imageSrc='${user.Avatar}'
    waitingImage="images/Loading_icon.gif">
    </div>
    </fieldset>
    <input type='submit' name='submit' id='saveUserCmd' value="Enregistrer" class="form-control btn-primary">
    </form>
    <div class="cancel">
    <button class="form-control btn-secondary" id="abortCmd">Annuler</button>
    </div>
    <div class="cancel">
    <hr>
    <button class="form-control btn-warning" id="warningCmd">Retrait de compte</button>
    </div>
    `);
    $('#abortCmd').on('click', function () {
        renderPhotoManager();
    });
    $('#warningCmd').on('click', function () {
        renderDeleteAccount(user.Id);
    });
    initFormValidation();
    initImageUploaders();
    addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    $('#createProfilForm').on('submit', async function (event) {
        let profil = getFormData($('#createProfilForm'));
        delete profil.matchedPassword;
        delete profil.matchedEmail;
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
        showWaitingGif(); // afficher GIF d’attente
        await API.modifyUserProfil(profil);
        renderPhotoManager();
    });
}
function renderUser(User) {
    let admin = false;
    let blocked = false;
    if (User.Authorizations.writeAccess == 2 && User.Authorizations.readAccess == 2) {
        admin = true
    }
    else if (User.Authorizations.writeAccess == 0 && User.Authorizations.readAccess == 0 && User.VerifyCode == "verified") {
        blocked = true
    }
    let adminIcon = admin ? "fas fa-user-cog" : "fas fa-user-alt";
    let blockedIcon = blocked ? "fa fa-ban redCmd" : "fa-regular fa-circle greenCmd";
    return $(`
    <div class="UserRow" User_id=${User.Id}">
    <div class="UserContainer">
        <div class="UserLayout">
        <div class="UserAvatar" style="background-image:url('${User.Avatar}')"></div>
            <div class="UserInfo">
                <span class="UserName">${User.Name}</span>
                <span class="UserEmail">${User.Email}</span>
            </div>
        </div>
        <div class="UserCommandPanel">
            <span class="dodgerblueCmd ${adminIcon}"editUserId="${User.Id}" title="Modifier ${User.Name}"></span>
            <span class="${blockedIcon}"blockUserId="${User.Id}" title="Modifier ${User.Name}"></span>
            <span class="fas fa-user-slash goldenrodCmd" deleteUserId="${User.Id}" title="Effacer ${User.Name}"></span>
        </div>
    </div>
</div>`);
}
async function renderManageUser() {
    eraseContent();
    updateHeader("Gestion des usagers", "deleteAccountAdmin");
    let loggedUserId = await API.retrieveLoggedUser().Id;
    let users = await API.GetAccounts();
    if (users != null) {
        if (loggedUserId != null) {
            users.data.forEach((user) => {
                if (user.Id != loggedUserId)
                    $("#content").append(renderUser(user));
            });
        }
        $('.greenCmd').on("click", async function (event) {
            var id = $(this).attr("blockUserId");

            if (await API.blockUser(id)) {
                renderManageUser();
            }
            else {
                console.log("Error");
            }
        });
        $('.redCmd').on("click", async function (event) {
            var id = $(this).attr("blockUserId");
            if (await API.unblockUser(id)) {
                renderManageUser();
            }
            else {
                console.log("Error");
            }
        });
        $('.dodgerblueCmd').on("click", async function (event) {
            var id = $(this).attr("editUserId");
            var className = $(this).attr("class");
            var isAdmin = className.includes("fas fa-user-cog");

            if (!isAdmin) {
                if (await API.promoteUser(id)) {
                    renderManageUser();
                }
                else {
                    console.log('Erreur!')
                }
            }

            else {
                if (await API.demote(id)) {
                    renderManageUser();
                }
                else {
                    console.log("Error")
                }
            }
        });
        $('.goldenrodCmd').on("click", async function (event) {
            var id = $(this).attr("deleteUserId");
            renderDeleteAccountAdmin(id);
        });
    }

}
async function renderDeleteAccountAdmin(id) {

    eraseContent();
    updateHeader("Retrait de compte", "deleteAccountAdmin");
    let User = await API.GetAccount(id);
    console.log(User)
    if (User != null) {
        $("#content").append(`<div class="content" style="text-align:center">
        <h4 style="margin-top:30px">Voulez-vous vraiment effacer cet usager et toutes ses photos?</h4>
            <div class="UserLayoutDelete">
            <div class="UserAvatar" style="background-image:url('${User.user.Avatar}')"></div>
            <div class="UserInfo">
                    <span class="UserName">${User.user.Name}</span>
                    <span class="UserEmail">${User.user.Email}</span>
                </div>
            </div>
        <div class="form">
            <button class="form-control btn-danger" id="deleteCmd">Effacer mon compte</button>
        </div>
        <div class="form">
            <button class="form-control btn-secondary" id="cancelCmd">Annuler</button>
        </div>
    </div>`);
        $('#deleteCmd').on("click", async function (event) {
            event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
            showWaitingGif(); // afficher GIF d’attente
            await API.unsubscribeAccount(id);
            renderManageUser();
        });
        $('#cancelCmd').on("click", function (event) {
            renderManageUser();
        })
    }
    else {
        console.log("Error");
    }
}
async function renderDeleteAccount(id) {
    let user = API.retrieveLoggedUser();
    eraseContent();
    updateHeader("Retrait de compte", "deleteAccount", user);
    $("#content").append(`<div class="content" style="text-align:center">
    <h4 style="margin-top:30px">Voulez-vous vraiment effacer votre compte?</h4>
    <div class="form">
        <button class="form-control btn-danger" id="deleteCmd">Effacer mon compte</button>
    </div>
    <div class="form">
        <button class="form-control btn-secondary" id="cancelCmd">Annuler</button>
    </div>
</div>`);
    $('#deleteCmd').on("click", async function (event) {
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
        showWaitingGif(); // afficher GIF d’attente
        await API.unsubscribeAccount(id);
        renderLoginForm("Votre compte a été retiré", "", "");
    });
    $('#cancelCmd').on("click", function (event) {
        renderPhotoManager();
    })
}
async function renderLoginForm(message = "", emailError = "", pwdError = "") {
    noTimeout(); //
    if(API.retrieveLoggedUser()!=null) //
    {
        API.logout();
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
    $('#createProfilCmd').on("click", function () {
        renderCreateProfil();
    });
    initFormValidation();
    initImageUploaders();
    if(Email == "[object Object]") ///
    {
        Email == "";
    }
    $('#loginForm').on("submit", function (event) {
        //  let user = getFormData('#loginform')
        let Email = $("#emailLogin").val();
        let Pwd = $("#passwordLogin").val();
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
        showWaitingGif();
        login(Email, Pwd);
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
function updateHeader(title, type, user) {
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
    else if (type == "photoManager" || type == "modifierProfil" || type == "deleteAccount") {
        $('#header').append($(`
            <img id='photoTitleContainer' src='./favicon.ico' /><h2>${title}</h2>
            <div class="UserAvatarSmall" style="background-image:url('${user.Avatar}')"></div>
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
            API.logout();
            renderLoginForm();
        });
        $('#editProfilMenuCmd').on("click", function () {
            renderModify();
        });
        $('#listPhotosMenuCmd').on("click", function () {
            renderPhotoManager();
        });
        $('#sortByDateCmd').on("click", function () {

        });
        $('#sortByOwnersCmd').on("click", function () {

        });
        $('#sortByLikesCmd').on("click", function () {

        });
        $('#ownerOnlyCmd').on("click", function () {

        });
        $('#aboutCmd').on("click", function () {
            renderAbout();
        });
    }
    else if (type == "photoManagerAdmin" || type == "deleteAccountAdmin") {
        let image = "";
        if (type == "deleteAccountAdmin") {
            image = "images/adminLogo.png";
        } else {
            image = user.Avatar;
        }
        $('#header').append($(`

            <img id='photoTitleContainer' src='./favicon.ico' /><h2>${title}</h2>
            <div class="UserAvatarSmall" style="background-image:url('${image}')"></div>
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
            renderManageUser();
        });
        $('#logoutCmd').on("click", function () {
            API.logout();
            renderLoginForm();
        });
        $('#editProfilMenuCmd').on("click", function () {
            renderModify();
        });
        $('#listPhotosMenuCmd').on("click", function () {
            renderPhotoManager();
        });
        $('#sortByDateCmd').on("click", function () {

        });
        $('#sortByOwnersCmd').on("click", function () {
        });
        $('#sortByLikesCmd').on("click", function () {
        });
        $('#ownerOnlyCmd').on("click", function () {
        });
        $('#aboutCmd').on("click", function () {
            renderAbout();
        });
    }
}

function renderAbout() {
    timeout();
    saveContentScrollPosition();
    eraseContent();
    updateHeader("À propos...", "about");

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
                    Auteur: Andrew Kartsakis et Maurice Agboton
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
