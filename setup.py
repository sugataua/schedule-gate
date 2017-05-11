from setuptools import setup

setup(
    name='schedule_gate',
    packages=['schedule_gate'],
    include_package_data=True,
    install_requires=[
        'flask',    
        'flask-restful',
        'flask-sqlalchemy'
        
    ]
)
