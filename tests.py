import os
import schedule_gate
import unittest
import tempfile

class ScheduleGateTestCase(unittest.TestCase):

    def setUp(self):
        self.db_fd, schedule_gate.app.config['DATABASE'] = tempfile.mkstemp()
        schedule_gate.app.config['TESTING'] = True
        self.app = schedule_gate.app.test_client()
        with schedule_gate.app.app_context():
            schedule_gate.init_db()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(schedule_gate.app.config['DATABASE'])

if __name__ == '__main__':
    unittest.main()