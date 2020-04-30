#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QTextTable>
#include <QTextTableFormat>
#include <QScrollBar>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QtWebSockets/QWebSocket>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT
    QJsonObject userData;

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();
public slots:
    void getUserData(QJsonObject userData);
    void changeColor();

private slots:
    void isConnected();
    void logError(QAbstractSocket::SocketError err);
    void sslError(QList<QSslError> errors);
    void newMessage(QString msg); void on_lineEdit_message_to_send_returnPressed();

private:
    bool m_debug = true;
    QWebSocket *m_webSocket;
    QUrl url = QUrl(QStringLiteral("ws://projet-logiciel.herokuapp.com/"));
    QTextTableFormat tableFormat;
    Ui::MainWindow *ui; 


    void appendMessage(const QString &from, const QString &message);
    void newParticipant(const QString &nick);
    void participantLeft(const QString &nick);
    void showInformation();
    QString sendSocketData(QString action, int id, QString pseudo, QString message);
    void setParticipants(QJsonArray participants);
};
#endif // MAINWINDOW_H
