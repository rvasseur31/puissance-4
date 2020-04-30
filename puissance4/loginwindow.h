#ifndef LOGINWINDOW_H
#define LOGINWINDOW_H

#include "mainwindow.h"

#include <QMainWindow>
#include <QNetworkReply>
#include <QJsonDocument>
#include <QJsonObject>

namespace Ui {
class LoginWindow;
}

class LoginWindow : public QMainWindow
{
    Q_OBJECT
    QNetworkAccessManager *networkManager;
    bool loginMode = true;
    QString serverUrl = "https://projet-logiciel.herokuapp.com/api/";
    MainWindow *game;
public:
    explicit LoginWindow(QWidget *parent = nullptr);
    ~LoginWindow();

private slots:
    void on_pushButtonSignIn_clicked();

    void on_pushButtonSignUp_clicked();

    void onResult(QNetworkReply *reply);
    void on_lineEditPassword_returnPressed();

private:
    Ui::LoginWindow *ui;
    void setLoginMode(bool action);
signals:
    void connected(QJsonObject userData);
};

#endif // LOGINWINDOW_H
