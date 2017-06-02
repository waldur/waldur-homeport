# BuildRequiresRepo: epel-release
# BuildRequiresRepo: https://rpm.nodesource.com/pub_4.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm

%define __conf_dir %{_sysconfdir}/%{name}
%define __data_dir %{_datadir}/%{name}

Name: waldur-homeport
Summary: Waldur HomePort
Version: 2.5.4
Release: 1.el7
License: MIT
Source0: %{name}-%{version}.tar.gz

BuildArch: noarch
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot

BuildRequires: bzip2
BuildRequires: git
BuildRequires: libjpeg-turbo-devel
BuildRequires: libpng-devel
BuildRequires: libtool
BuildRequires: make
BuildRequires: nasm
BuildRequires: nodejs < 6
BuildRequires: rubygem-sass

%description
Web interface for Waldur MasterMind cloud orchestrator.

%prep
%setup -q

%build
# Extract package version
VERSION=$(grep '"version":' package.json | awk '{print $2}' | sed -e "s/\"//g;s/,//g")

# Inject package version
sed -i "s/buildId: 'develop'/buildId: '$VERSION'/" app/scripts/components/configs/base-config.js

npm install --global bower grunt-cli

npm install
bower --allow-root --no-color install

grunt prodbatch

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}%{_datadir}
mkdir -p %{buildroot}%{__conf_dir}

cp packaging%{__conf_dir}/config.json %{buildroot}%{__conf_dir}
cp packaging%{__conf_dir}/nginx.conf %{buildroot}%{__conf_dir}

cp -r dist %{buildroot}%{__data_dir}

%clean
rm -rf %{buildroot}

%files
%defattr(-,root,root,-)
%{__data_dir}
%config(noreplace) %{__conf_dir}/config.json
%config(noreplace) %{__conf_dir}/nginx.conf

%changelog
* Fri Jun 2 2017 Jenkins <jenkins@opennodecloud.com> - 2.5.4-1.el7
- New upstream release

* Sat May 6 2017 Jenkins <jenkins@opennodecloud.com> - 2.5.2-1.el7
- New upstream release

* Mon Apr 24 2017 Jenkins <jenkins@opennodecloud.com> - 2.5.1-1.el7
- New upstream release

* Sun Apr 23 2017 Jenkins <jenkins@opennodecloud.com> - 2.5.0-1.el7
- New upstream release

* Mon Apr 17 2017 Jenkins <jenkins@opennodecloud.com> - 2.4.5-1.el7
- New upstream release

* Sun Apr 16 2017 Jenkins <jenkins@opennodecloud.com> - 2.4.4-1.el7
- New upstream release

* Sat Apr 1 2017 Jenkins <jenkins@opennodecloud.com> - 2.4.3-1.el7
- New upstream release

* Mon Mar 20 2017 Jenkins <jenkins@opennodecloud.com> - 2.4.2-1.el7
- New upstream release

* Thu Mar 16 2017 Jenkins <jenkins@opennodecloud.com> - 2.4.1-1.el7
- New upstream release

* Wed Mar 15 2017 Jenkins <jenkins@opennodecloud.com> - 2.4.0-1.el7
- New upstream release

* Sat Feb 18 2017 Jenkins <jenkins@opennodecloud.com> - 2.3.0-1.el7
- New upstream release

* Wed Feb 8 2017 Jenkins <jenkins@opennodecloud.com> - 2.2.5-1.el7
- New upstream release

* Thu Jan 26 2017 Jenkins <jenkins@opennodecloud.com> - 2.2.4-1.el7
- New upstream release

* Tue Jan 24 2017 Jenkins <jenkins@opennodecloud.com> - 2.2.3-1.el7
- New upstream release

* Thu Jan 19 2017 Jenkins <jenkins@opennodecloud.com> - 2.2.2-1.el7
- New upstream release

* Thu Jan 19 2017 Jenkins <jenkins@opennodecloud.com> - 2.2.1-1.el7
- New upstream release

* Tue Jan 17 2017 Jenkins <jenkins@opennodecloud.com> - 2.2.0-1.el7
- New upstream release

* Sat Jan 14 2017 Jenkins <jenkins@opennodecloud.com> - 2.1.0-1.el7
- New upstream release

* Fri Dec 23 2016 Juri Hudolejev <juri@opennodecloud.com> - 2.0.0-1
- New upstream release

* Fri Nov 11 2016 Juri Hudolejev <juri@opennodecloud.com> - 0.1.0-1
- Initial version of the package
