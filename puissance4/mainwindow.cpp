#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QDebug>
#include <QMessageBox>

/**
 * @brief MainWindow::setIsMyTurnToPlay: Handle who is suppose to play, edit LabelStatus
 */
void MainWindow::setIsMyTurnToPlay()
{
    isMyTurnToPlay = !isMyTurnToPlay;
    isMyTurnToPlay ? ui->label_status->setText("A vous de jouer") : ui->label_status->setText("En attente du coup adverse");
}

/**
 * @brief MainWindow::MainWindow: initialize websocket connection + game board
 * @param parent : QWidget
 */
MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent), ui(new Ui::MainWindow)
{   
    ui->setupUi(this);
    ui->pushButton_restart->setHidden(true);
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
    appendMessage("Puissance 4", "Vous êtes les bleus");
}

/**
 * @brief MainWindow::~MainWindow: Send a websocket -> the user leave + delete all pointer
 */
MainWindow::~MainWindow() {
    qDebug() << __FUNCTION__<< "Destructor";
    m_webSocket->sendTextMessage(sendSocketData("participant-left",userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), ""));
    m_webSocket->close();
    delete ui;
    foreach (auto boardElement, boardElements) { delete boardElement; }
}

/**
 * @brief MainWindow::getUserData: get user data after connection
 * @param userData : JsonObject with id, pseudo, email ect...
 */
void MainWindow::getUserData(QJsonObject userData)
{
    this->userData = userData;
    qDebug() << userData;
    generateBoard(matrixArray);
}

/**
 * @brief MainWindow::appendMessage: show new message sended
 * @param from : User pseudo
 * @param message : User message
 */
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

/**
 * @brief MainWindow::newParticipant: Add new pseudo in pseudo list
 * @param nick : User pseudo
 */
void MainWindow::newParticipant(const QString &nick)
{
    if (nick.isEmpty())
        return;
    QColor color = ui->textEdit_users_messages->textColor();
    ui->textEdit_users_messages->setTextColor(Qt::gray);
    ui->textEdit_users_messages->append(tr("* %1 has joined").arg(nick));
    ui->textEdit_users_messages->setTextColor(color);
}

/**
 * @brief MainWindow::setParticipants: Set all pseudo of the room
 * @param participants : Array of user pseudo
 */
void MainWindow::setParticipants(QJsonArray participants) {
    ui->listWidget->clear();
    for (int index = 0; index < participants.size(); index++) {
        ui->listWidget->addItem(participants.at(index)["pseudo"].toString());
    }
}

/**
 * @brief MainWindow::participantLeft: Remove user pseudo from pseudo List + write a message in the chat
 * @param nick: User pseudo
 */
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

/**
 * @brief MainWindow::isConnected: When user is connected (websocket)
 */
void MainWindow::isConnected()
{
    m_webSocket->sendTextMessage(sendSocketData("new-participant",userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), ""));
}

/**
 * @brief MainWindow::logError: Write the error in console
 * @param err: WebSocket error
 */
void MainWindow::logError(QAbstractSocket::SocketError err)
{
    qDebug() << "Error: ";
    qDebug() << err;
}

/**
 * @brief MainWindow::sslError: Write the error in console
 * @param errors: WebSocket errors
 */
void MainWindow::sslError(QList<QSslError> errors)
{
    qDebug() << "SSLError: ";
    qDebug() << errors;
    m_webSocket->ignoreSslErrors(errors);
}

/**
 * @brief MainWindow::newMessage: called when websocket server send a message
 * @param msg : Json object with an action
 */
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
        matrixArray = QJsonArray();
        for(int i = 0; i < 6; i++){
            QJsonArray row;
            for(int j = 0; j < 7; j++){
                row.push_back(0);
            }
            matrixArray.push_back(row);
        }
        generateBoard(matrixArray);
    } else if (json["action"] == "new-message") {
        appendMessage(json["sender_pseudo"].toString(), json["message"].toString());
    } else if (json["action"] == "new-room") {
        userData["roomId"] = json["roomId"];
        ui->pushButton_restart->setHidden(true);
        ui->label_status->setText("En attente du coup adverse");
        if (json["isTurnOf"].toInt() == userData["id"].toInt()) setIsMyTurnToPlay();
    } else if (json["action"] == "leave-room") {
        userData["roomId"] = 0;
        ui->label_status->setText("En attente d'un adversaire");
    } else if (json["action"] == "new-move") {
        matrixArray = json["board"].toArray();
        generateBoard(matrixArray);
        setIsMyTurnToPlay();
    } else if (json["action"] == "end-game") {
        isGameFinished = true;
        ui->pushButton_restart->setHidden(false);
        if (json["winner"].toInt() == -1) {
            ui->label_status->setText("Match nul");
            return;
        }
        if (json["winner"].toInt() == userData["id"].toInt()) ui->label_status->setText("Vous avez gagné");
        else ui->label_status->setText("Vous avez perdu");
    } else if (json["action"] == "restart") {
        isGameFinished = false;
        ui->pushButton_restart->setHidden(true);
        matrixArray = json["board"].toArray();
        generateBoard(matrixArray);
        isMyTurnToPlay ? ui->label_status->setText("A vous de jouer") : ui->label_status->setText("En attente du coup adverse");
    }
}

/**
 * @brief MainWindow::on_lineEdit_message_to_send_returnPressed: Send a message in the chat when returnPressed in lineEdit
 */
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

/**
 * @brief MainWindow::sendSocketData: Data to send to the websocket server
 * @param action : Action to do
 * @param id : user id
 * @param pseudo: user pseudo
 * @param roomId : roomId
 * @param message : A message
 * @return JsonObject converted into a string
 */
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
    makeMove("0");
}

void MainWindow::on_pushButton_2_clicked()
{
    makeMove("1");
}

void MainWindow::on_pushButton_3_clicked()
{
    makeMove("2");
}

void MainWindow::on_pushButton_4_clicked()
{
    makeMove("3");
}

void MainWindow::on_pushButton_5_clicked()
{
    makeMove("4");
}

void MainWindow::on_pushButton_6_clicked()
{
    makeMove("5");
}

void MainWindow::on_pushButton_7_clicked()
{
    makeMove("6");
}

/**
 * @brief MainWindow::makeMove: Send to websocket server the column where the user want to play
 * @param col : number of the column
 */
void MainWindow::makeMove(QString col) {
    if (isMyTurnToPlay && !isGameFinished) {
        m_webSocket->sendTextMessage(sendSocketData("new-move", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), col));
    } else if(isGameFinished) {
        QMessageBox::information(this, tr("Attention"),
                                 tr("La partie est terminée, recommencer s'en une pour pouvoir jouer"));
    }
    else {
        QMessageBox::information(this, tr("Attention"),
                                 tr("Ce n'est pas à vous de jouer, n'essayer pas de tricher"));
    }
}

/**
 * @brief MainWindow::generateBoard: generate the game board in a grid layout
 * @param matrix : 2 dimentional Array
 */
void MainWindow::generateBoard(QJsonArray matrix){
    for(int i = 0; i < matrix.size(); i++){
        for(int j = 0; j < matrix[i].toArray().size(); j++){
            QPushButton* boardElement = new QPushButton("");
            if (matrix[i].toArray()[j].toInt() == 0) boardElement->setStyleSheet("QPushButton {background-color: #FFFFFF}");
            else if (matrix[i].toArray()[j].toInt() == userData["id"].toInt()) boardElement->setStyleSheet("QPushButton {background-color: #3333FF}");
            else boardElement->setStyleSheet("QPushButton {background-color: #FF3333}");
            ui->gridLayout_board->addWidget(boardElement, i, j);
            boardElements.push_back(boardElement);
        }
    }
}  

/**
 * @brief MainWindow::on_pushButton_restart_clicked: Restart a game
 */
void MainWindow::on_pushButton_restart_clicked()
{
    m_webSocket->sendTextMessage(sendSocketData("restart", userData["id"].toInt(), userData["pseudo"].toString(), userData["roomId"].toInt(), ""));
}
