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
    QString serverUrl = "http://192.168.1.33:3000/api/";
    MainWindow *game = nullptr;
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
