#include "mainwindow.h"
#include "ui_mainwindow.h"


#include <QDebug>



MainWindow::MainWindow(QWidget *parent) :
    QDialog(parent), ui(new Ui::MainWindow), auJoueurDeJouer(false)
{
    ui->setupUi(this);

    setWindowTitle("Puissance 5");
    setMinimumSize(468, 525);
    setModal(true);

    int k=0, j=0;

    for(int i=1;i<7;i++){
        for(j=0;j<7;j++){
            listeLabelList.push_back(new QLabel());
            ui->gridLayout->addWidget(listeLabelList[k],i,j);
            listeLabelList[k]->setStyleSheet("background-color:#FFFFF; border-radius:34px;");
            k++;
        }
    }
    ordiJaune = false;
}


MainWindow::~MainWindow()
{
    for(int i=0;i<42;i++){
        delete listeLabelList[i];
        listeLabelList[i]=0;
    }
    delete ui;
}

bool MainWindow::partieACommence(){
    if(listeLabelList[35]->styleSheet()!="background-color: #FFFFF; border-radius:34px;")
        return true;
    else if(listeLabelList[36]->styleSheet()!="background-color: #FFFFF; border-radius:34px;")
        return true;
    else if(listeLabelList[37]->styleSheet()!="background-color: #FFFFF; border-radius:34px;")
        return true;
    else if(listeLabelList[38]->styleSheet()!="background-color: #FFFFF; border-radius:34px;")
        return true;
    else if(listeLabelList[39]->styleSheet()!="background-color: #FFFFF; border-radius:34px;")
        return true;
    else if(listeLabelList[40]->styleSheet()!="background-color: #FFFFF; border-radius:34px;")
        return true;
    else if(listeLabelList[41]->styleSheet()!="background-color: #FFFFF; border-radius:34px;")
        return true;
   return false;
}

void MainWindow::disableAllButtonColumn(){
    ui->pushButton_1->setDisabled(true);
    ui->pushButton_2->setDisabled(true);
    ui->pushButton_3->setDisabled(true);
    ui->pushButton_4->setDisabled(true);
    ui->pushButton_5->setDisabled(true);
    ui->pushButton_6->setDisabled(true);
    ui->pushButton_7->setDisabled(true);
    //ui->pushButton->setDisabled(false)
}

