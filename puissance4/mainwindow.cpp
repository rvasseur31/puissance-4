#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QDebug>
#include <QMessageBox>

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent), ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    for(int i = 0; i < 6; i++){
        QJsonArray row;
        for(int j = 0; j < 7; j++){
            row.push_back(0);
        }
        matrixArray.push_back(row);
    }
    generateBoard(matrixArray);
    m_webSocket = new QWebSocket();
    if (m_debug)
        qDebug() << "WebSocket server:" << url;
    m_webSocket->open(url);
    connect(m_webSocket, SIGNAL(connected()), this, SLOT(isConnected()));
    connect(m_webSocket, SIGNAL(sslErrors(QList<QSslError>)), this, SLOT(sslError(QList<QSslError>)));
    connect(m_webSocket, SIGNAL(error(QAbstractSocket::SocketError)), this, SLOT(logError(QAbstractSocket::SocketError)));
    connect(m_webSocket, SIGNAL(textMessageReceived(QString)), this, SLOT(newMessage(QString)));
}

MainWindow::~MainWindow() {
    qDebug() << __FUNCTION__<< "Destructor";
    m_webSocket->sendTextMessage(sendSocketData("participant-left",userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), ""));
    m_webSocket->close();
    delete ui;
}

void MainWindow::getUserData(QJsonObject userData)
{
    this->userData = userData;
    qDebug() << userData;
    generateBoard(matrixArray);
}

void MainWindow::appendMessage(const QString &from, const QString &message)
{
    if (from.isEmpty() || message.isEmpty())
        return;
    QTextCursor cursor(ui->textEdit_users_messages->textCursor());
    cursor.movePosition(QTextCursor::End);
    QTextTable *table = cursor.insertTable(1, 2, tableFormat);
    table->cellAt(0, 0).firstCursorPosition().insertText('<' + from + "> ");
    table->cellAt(0, 1).firstCursorPosition().insertText(message);
    QScrollBar *bar = ui->textEdit_users_messages->verticalScrollBar();
    bar->setValue(bar->maximum());
}

void MainWindow::newParticipant(const QString &nick)
{
    if (nick.isEmpty())
        return;
    QColor color = ui->textEdit_users_messages->textColor();
    ui->textEdit_users_messages->setTextColor(Qt::gray);
    ui->textEdit_users_messages->append(tr("* %1 has joined").arg(nick));
    ui->textEdit_users_messages->setTextColor(color);
}

void MainWindow::setParticipants(QJsonArray participants) {
    ui->listWidget->clear();
    for (int index = 0; index < participants.size(); index++) {
         ui->listWidget->addItem(participants.at(index)["pseudo"].toString());
    }
}

void MainWindow::participantLeft(const QString &nick)
{
    if (nick.isEmpty())
        return;
    QList<QListWidgetItem *> items = ui->listWidget->findItems(nick,
                                                           Qt::MatchExactly);
    if (items.isEmpty())
        return;

    delete items.at(0);
    QColor color = ui->textEdit_users_messages->textColor();
    ui->textEdit_users_messages->setTextColor(Qt::gray);
    ui->textEdit_users_messages->append(tr("* %1 has left").arg(nick));
    ui->textEdit_users_messages->setTextColor(color);
}

void MainWindow::showInformation()
{
    if (ui->listWidget->count() == 1) {
        QMessageBox::information(this, tr("Chat"),
                                 tr("Launch several instances of this "
                                    "program on your local network and "
                                    "start chatting!"));
    }
}

void MainWindow::isConnected()
{
    m_webSocket->sendTextMessage(sendSocketData("new-participant",userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), ""));
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
       qDebug() << __LINE__ <<msg;
       QJsonDocument doc = QJsonDocument::fromJson(msg.toUtf8());
       QJsonObject json = doc.object();
       if (json["action"] == "new-participant") {
           setParticipants(json["participants"].toArray());
           newParticipant(json["sender_pseudo"].toString());
       } else if (json["action"] == "participant-left") {
           participantLeft(json["sender_pseudo"].toString());
       } else if (json["action"] == "new-message") {
           appendMessage(json["sender_pseudo"].toString(), json["message"].toString());
       } else if (json["action"] == "new-room") {
           userData["roomId"] = json["roomId"];
           qDebug() << userData;
       } else if (json["action"] == "leave-room") {
           userData["roomId"] = 0;
           qDebug() << userData;
       } else if (json["action"] == "new-move") {
           matrixArray = json["board"].toArray();
           generateBoard(matrixArray);
       }
}

void MainWindow::on_lineEdit_message_to_send_returnPressed()
{
    QString text = ui->lineEdit_message_to_send->text();
    if (text.isEmpty())
        return;

    if (text.startsWith(QChar('/'))) {
        QColor color = ui->textEdit_users_messages->textColor();
        ui->textEdit_users_messages->setTextColor(Qt::red);
        ui->textEdit_users_messages->append(tr("! Unknown command: %1")
                         .arg(text.left(text.indexOf(' '))));
        ui->textEdit_users_messages->setTextColor(color);
    } else {
        m_webSocket->sendTextMessage(sendSocketData("new-message", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), text));
    }

    ui->lineEdit_message_to_send->clear();
}

void MainWindow::changeColor()
{
    ui->pushButton_1->setAutoFillBackground(true);
    ui->pushButton_1->setStyleSheet("QPushButton::checked{background-color: rgb(255, 0, 0); color: rgb(255, 255, 255)}");
    update();

//    ui->pushButton_1->setStyleSheet("QPushButton#pushButton_1 { background-color: yellow }");

}

QString MainWindow::sendSocketData(QString action, int id, QString pseudo, int roomId, QString message) {
    QJsonObject jsonObject;
    jsonObject["action"] = action;
    jsonObject["sender_id"] = id;
    jsonObject["sender_pseudo"] = pseudo;
    jsonObject["roomId"] = roomId;
    jsonObject["message"] = message;
    QJsonDocument doc(jsonObject);
    return QLatin1String(doc.toJson(QJsonDocument::Compact));
}

void MainWindow::on_pushButton_1_clicked()
{
    m_webSocket->sendTextMessage(sendSocketData("new-move", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), "0"));
}

void MainWindow::on_pushButton_2_clicked()
{
     m_webSocket->sendTextMessage(sendSocketData("new-move", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), "1"));
}

void MainWindow::on_pushButton_3_clicked()
{
     m_webSocket->sendTextMessage(sendSocketData("new-move", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), "2"));
}

void MainWindow::on_pushButton_4_clicked()
{
     m_webSocket->sendTextMessage(sendSocketData("new-move", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), "3"));
}

void MainWindow::on_pushButton_5_clicked()
{
     m_webSocket->sendTextMessage(sendSocketData("new-move", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), "4"));
}

void MainWindow::on_pushButton_6_clicked()
{
    m_webSocket->sendTextMessage(sendSocketData("new-move", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), "5"));
}

void MainWindow::on_pushButton_7_clicked()
{
     m_webSocket->sendTextMessage(sendSocketData("new-move", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), "6"));
}

void MainWindow::generateBoard(QJsonArray matrix){
    qDebug() << "Generate Board";
    qDebug() << matrix;
    for(int i = 0; i < matrix.size(); i++){
        for(int j = 0; j < matrix[i].toArray().size(); j++){
            if (matrix[i].toArray()[j].toInt() == 0) ui->gridLayout_board->addWidget(new QPushButton(""), i, j);
            else if (matrix[i].toArray()[j].toInt() == userData["id"].toInt()) ui->gridLayout_board->addWidget(new QPushButton("x"), i, j);
            else ui->gridLayout_board->addWidget(new QPushButton("o"), i, j);
        }
    }
}
