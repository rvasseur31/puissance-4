#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QDebug>

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent), ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    m_webSocket = new QWebSocket();
    if (m_debug)
        qDebug() << "WebSocket server:" << url;
    m_webSocket->open(url);
//    connect(m_webSocket, &QWebSocket::connected, this, &MainWindow::onConnected);
//    connect(m_webSocket, &QWebSocket::disconnected, this, &MainWindow::onClosed);
    connect(m_webSocket, SIGNAL(connected()), this, SLOT(isConnected()));
    connect(m_webSocket, SIGNAL(sslErrors(QList<QSslError>)), this, SLOT(sslError(QList<QSslError>)));
    connect(m_webSocket, SIGNAL(error(QAbstractSocket::SocketError)), this, SLOT(logError(QAbstractSocket::SocketError)));
    connect(m_webSocket, SIGNAL(textMessageReceived(QString)), this, SLOT(newMessage(QString)));
    connect(m_webSocket, SIGNAL(textFrameReceived(QString,bool)), this, SLOT(newMessageBit(QString,bool)));
}


MainWindow::~MainWindow() {
    m_webSocket->close();
    delete ui;
}

//void MainWindow::onConnected()
//{
//    if (m_debug)
//        qDebug() << "WebSocket connected";
//    connect(m_webSocket, &QWebSocket::textMessageReceived,
//            this, &MainWindow::onTextMessageReceived);
//    m_webSocket->sendTextMessage(QStringLiteral("Hello, world!"));
//}

//void MainWindow::onTextMessageReceived(QString message)
//{
//    if (m_debug)
//        qDebug() << "Message received:" << message;
//    m_webSocket->close();
//}

//void MainWindow::onClosed()
//{
//    m_webSocket->close();
//}

void MainWindow::isConnected()
{
       m_webSocket->sendTextMessage("Hello From Qt!!!");
}

void MainWindow::logError(QAbstractSocket::SocketError err)
{
       qDebug() << "Error: ";
       qDebug() << err;
}

void MainWindow::sslError(QList<QSslError> errors)
{
       qDebug() << "SSLError: ";
       qDebug() << errors;
       m_webSocket->ignoreSslErrors(errors);
}


void MainWindow::newMessage(QString msg)
{
       qDebug() << msg;
}

void MainWindow::newMessageBit(QString msg, bool isLast)
{
       qDebug() << msg;
       qDebug() << isLast;
}





