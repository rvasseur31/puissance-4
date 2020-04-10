#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QtWebSockets/QWebSocket>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
//    void onConnected();
//    void onTextMessageReceived(QString message);
//    void onClosed();
    void isConnected();
    void logError(QAbstractSocket::SocketError err);
    void sslError(QList<QSslError> errors);
    void newMessage(QString msg);
    void newMessageBit(QString msg, bool isLast);
private:
    bool m_debug = true;
    QWebSocket *m_webSocket;
    QUrl url = QUrl(QStringLiteral("ws://localhost:3000"));
    Ui::MainWindow *ui;

};
#endif // MAINWINDOW_H
