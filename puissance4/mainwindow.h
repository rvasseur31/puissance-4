#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QDialog>
#include <QList>
#include <QWidget>
#include <QObject>
#include <QLabel>

namespace Ui {
class MainWindow;
}

class MainWindow : public QDialog
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow();
    bool partieACommence();
    void disableAllButtonColumn();

private slots:
    void on_pushButton_1_clicked();
    void on_pushButton_2_clicked();
    void on_pushButton_3_clicked();
    void on_pushButton_4_clicked();
    void on_pushButton_5_clicked();
    void on_pushButton_6_clicked();
    void on_pushButton_7_clicked();

    void on_pushButton_clicked();
private:
    Ui::MainWindow *ui;
    QLabel *listeLabel;
    QList<QLabel*> listeLabelList;
    bool auJoueurDeJouer;
    bool ordiJaune;

};
#endif // MAINWINDOW_H
