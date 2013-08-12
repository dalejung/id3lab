import IPython

import ts_charting.lab.lab as tslab
import ipycli.standalone as sa

from workbench import sharedx

class ID3Lab(tslab.Lab):
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
        name = self.get_varname()
        return sa.link(name)

    def _repr_html_(self):
        out = '<strong>stations:</strong> <br />'
        out += '<br />'.join(self.stations.keys())
        link = self.link().data
        out += '<br />' + link
        return out

    @property
    def html_obj(self):
        # for now default to sharedx
        return sharedx
