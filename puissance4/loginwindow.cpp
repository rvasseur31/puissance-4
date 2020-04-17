#include "loginwindow.h"
#include "ui_loginwindow.h"

#include<QDebug>

LoginWindow::LoginWindow(QWidget *parent) :
    QMainWindow(parent), ui(new Ui::LoginWindow)
{
    ui->setupUi(this);
    networkManager = new QNetworkAccessManager(this);
    connect(networkManager,SIGNAL(finished(QNetworkReply*)), SLOT(onResult(QNetworkReply*)));
}

LoginWindow::~LoginWindow()
{
    qDebug() << __FUNCTION__<< "Destructor";
    delete game;
    delete ui;
}

void LoginWindow::on_pushButtonSignIn_clicked()
{
    QString email = ui->lineEditUsername->text();
    QString password = ui->lineEditPassword->text();

    qDebug() << __FUNCTION__ << "Username : " << email << ", Password : " << password;
    if (email == "" || password == "") {
        ui->statusbar->showMessage("You should provide a login and a password");
        return;
    }
    QJsonObject jsObj;
    jsObj["email"] = email;
    if (!loginMode)
        jsObj["pseudo"] = "pseudo";
    jsObj["password"] = password;
    QString route;
    if (loginMode){
        route = "auth/login";
    }
    else {
        route = "auth/register";
    }
    QUrl url(serverUrl + route);
    QNetworkRequest request(url);
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    networkManager->post(request, QJsonDocument(jsObj).toJson()); ui->statusbar->showMessage("Authenticating on " + serverUrl + route + " ..."); }  void LoginWindow::setLoginMode(bool action) { if (action) { ui->groupBoxSignIn->setTitle("Sign In"); ui->labelNoAccount->setText("You don't have an account ? "); ui->pushButtonSignUp->setText("Sign Up"); ui->pushButtonSignIn->setText("Sign In");  } else { ui->groupBoxSignIn->setTitle("Sign Up"); ui->labelNoAccount->setText("You have an account ? "); ui->pushButtonSignUp->setText("Sign in"); ui->pushButtonSignIn->setText("Sign up"); }
    loginMode = !loginMode;
}


void LoginWindow::on_pushButtonSignUp_clicked()
{
    setLoginMode(!loginMode);
}

void LoginWindow::onResult(QNetworkReply *reply) {
    qDebug() << __FUNCTION__ << reply;
    if (reply->error() == QNetworkReply::NoError) {
        QString       strReply = reply->readAll();
        QJsonDocument jsDoc = QJsonDocument::fromJson(strReply.toUtf8());
        QJsonObject json = jsDoc.object();
        game = new MainWindow();
        connect(this, SIGNAL(connected(QJsonObject)), game, SLOT(getUserData(QJsonObject)));
        emit connected(json["body"].toObject());
        this->close();
        game->show();

    } else {
        // erreur réseau
        qDebug() << "ERROR" << reply->readAll();
    }
    reply->deleteLater();
}


void LoginWindow::on_lineEditPassword_returnPressed()
{
    on_pushButtonSignIn_clicked();
}
