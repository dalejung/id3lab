from ipycli.standalone import DirectoryHtml
import os.path

def curpath():
    pth, _ = os.path.split(os.path.abspath(__file__))
    return pth

sharedx = DirectoryHtml(curpath(), 'sharedx.html')
