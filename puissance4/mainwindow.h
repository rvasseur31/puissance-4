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
    QJsonDocument board;
    QJsonArray matrixArray;

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

    void on_pushButton_1_clicked();

    void on_pushButton_2_clicked();

    void on_pushButton_3_clicked();

    void on_pushButton_4_clicked();

    void on_pushButton_5_clicked();

    void on_pushButton_7_clicked();

    void on_pushButton_6_clicked();

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
    void setParticipants(QJsonArray participants);
    QString sendSocketData(QString action, int id, QString pseudo, int roomId, QString message);
    void generateBoard(QJsonArray matrix);
};
#endif // MAINWINDOW_H
