#include "loginwindow.h"
#include "matrixgame.h"

#include <QApplication>

#include <string>

using namespace std;

int main(int argc, char *argv[])
{

    QApplication a(argc, argv);
    LoginWindow w;
    w.show();
    return a.exec();


}
