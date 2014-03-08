import IPython

import ts_charting.lab.lab as tslab
import nbx.handlers.standalone as sa

from workbench import sharedx

class ID3Lab(tslab.Lab):
    _html_obj = None
    def __init__(self, draw=False, html_obj=None):
        super(ID3Lab, self).__init__(draw=draw)
        if html_obj is None:
            html_obj = sharedx
        self._html_obj = html_obj

    def get_varname(self):
        """
        Try to get the variable that this lab is
        bound to in the IPython kernel
        """
        inst = IPython.InteractiveShell._instance
        for k,v in inst.user_ns.iteritems():
            if v is self and not k.startswith('_'):
                return k

    def link(self):
        return sa.autolink(self)

    def _repr_javascript_(self):
        """
        Output:

        stations:
        AAPL
        IBM

        <link>

        Note:
            Uses Javascript because sa.link() returns javascript. This is
            because sa.link needs to use the location.href to get the notebook_id
            since we cannot grab that from within the notebook kernel.
        """
        js = """
        element.append('{0}');
        container.show();
        """
        station_text = '<strong>stations:</strong> <br />'
        station_text += '<br />'.join(self.stations.keys())
        out = js.format(station_text)

        link = self.link().data
        out += 'element.append("<br />");' + link
        return out

    @property
    def html_obj(self):
        return self._html_obj

    def __str__(self):
        return
