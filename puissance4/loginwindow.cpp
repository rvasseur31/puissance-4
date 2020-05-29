#include "loginwindow.h"
#include "ui_loginwindow.h"

#include<QDebug>

/**
 * @brief LoginWindow::LoginWindow: initialize network manager
 * @param parent: Qwidget
 */
LoginWindow::LoginWindow(QWidget *parent) :
    QMainWindow(parent), ui(new Ui::LoginWindow)
{
    ui->setupUi(this);
    setLoginMode(loginMode);
    networkManager = new QNetworkAccessManager(this);
    connect(networkManager,SIGNAL(finished(QNetworkReply*)), SLOT(onResult(QNetworkReply*)));
}

/**
 * @brief LoginWindow::~LoginWindow: delete the window
 */
LoginWindow::~LoginWindow()
{
    qDebug() << __FUNCTION__<< "Destructor";
    delete ui;
    if (game != nullptr) delete game;
}

/**
 * @brief LoginWindow::on_pushButtonSignIn_clicked: send to the server all informations needed for sign in or sign up
 */
void LoginWindow::on_pushButtonSignIn_clicked()
{
    QString email = ui->lineEditUsername->text();
    QString password = ui->lineEditPassword->text();
    QString pseudo = ui->lineEditPseudo->text();

    qDebug() << __FUNCTION__ << "Username : " << email << ", Password : " << password;
    if (email == "" || password == "") {
        QString error = "You should provide a login and a password";
        ui->statusbar->showMessage(error);
        ui->label_status->setText(error);
        return;
    }
    QJsonObject jsObj;
    jsObj["email"] = email;
    if (!loginMode) jsObj["pseudo"] = pseudo;
    jsObj["password"] = password;

    QString route;
    if (loginMode) route = "auth/login";
    else route = "auth/register";

    QUrl url(serverUrl + route);
    QNetworkRequest request(url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    networkManager->post(request, QJsonDocument(jsObj).toJson());
    ui->statusbar->showMessage("Authenticating on " + serverUrl + route + " ...");
}

/**
 * @brief LoginWindow::setLoginMode : Edit view if user wanted to sign in or sign up
 * @param action : bool
 */
void LoginWindow::setLoginMode(bool action) {
    if (action) {
        ui->groupBoxSignIn->setTitle("Sign In");
        ui->labelNoAccount->setText("You don't have an account ? ");
        ui->pushButtonSignUp->setText("Sign Up");
        ui->pushButtonSignIn->setText("Sign In");
        ui->labelPseudo->setVisible(false);
        ui->lineEditPseudo->setVisible(false);
    } else { ui->groupBoxSignIn->setTitle("Sign Up");
        ui->labelNoAccount->setText("You have an account ? ");
        ui->pushButtonSignUp->setText("Sign in");
        ui->pushButtonSignIn->setText("Sign up");
        ui->labelPseudo->setVisible(true);
        ui->lineEditPseudo->setVisible(true);
    }
    loginMode = action;
}


void LoginWindow::on_pushButtonSignUp_clicked()
{
    setLoginMode(!loginMode);
}

/**
 * @brief LoginWindow::onResult: result of the auth request, launch mainwindow is success, otherwise show error message
 * @param reply
 */
void LoginWindow::onResult(QNetworkReply *reply) {
    qDebug() << __FUNCTION__ << reply;
    ui->statusbar->showMessage("");
    QString       strReply = reply->readAll();
    QJsonDocument jsDoc = QJsonDocument::fromJson(strReply.toUtf8());
    QJsonObject json = jsDoc.object();
    if (reply->error() == QNetworkReply::NoError) {   
        game = new MainWindow();
        connect(this, SIGNAL(connected(QJsonObject)), game, SLOT(getUserData(QJsonObject)));
        emit connected(json["body"].toObject());
        this->close();
        game->show();

    } else {
        // erreur réseau
        qDebug() << "ERROR" << json;
        ui->label_status->setText(json["message"].toString());
    }
    reply->deleteLater();
}


void LoginWindow::on_lineEditPassword_returnPressed()
{
    on_pushButtonSignIn_clicked();
}
