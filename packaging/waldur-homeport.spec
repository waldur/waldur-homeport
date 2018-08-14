# BuildRequiresRepo: epel-release
# BuildRequiresRepo: https://rpm.nodesource.com/pub_6.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm

%define __conf_dir %{_sysconfdir}/%{name}
%define __data_dir %{_datadir}/%{name}

Name: waldur-homeport
Summary: Waldur HomePort
Version: 3.0.7
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
BuildRequires: nodejs
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

npm install -g yarn
yarn
npm run build

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}%{_datadir}
mkdir -p %{buildroot}%{__conf_dir}

cp packaging%{__conf_dir}/config.json %{buildroot}%{__conf_dir}
cp packaging%{__conf_dir}/nginx.conf %{buildroot}%{__conf_dir}

cp -r build %{buildroot}%{__data_dir}

%clean
rm -rf %{buildroot}

%files
%defattr(-,root,root,-)
%{__data_dir}
%config(noreplace) %{__conf_dir}/config.json
%config(noreplace) %{__conf_dir}/nginx.conf

%changelog
* Tue Aug 14 2018 Jenkins <jenkins@opennodecloud.com> - 3.0.7-1.el7
- New upstream release

* Sun Aug 12 2018 Jenkins <jenkins@opennodecloud.com> - 3.0.6-1.el7
- New upstream release

* Fri Aug 10 2018 Jenkins <jenkins@opennodecloud.com> - 3.0.5-1.el7
- New upstream release

* Thu Aug 9 2018 Jenkins <jenkins@opennodecloud.com> - 3.0.4-1.el7
- New upstream release

* Wed Aug 8 2018 Jenkins <jenkins@opennodecloud.com> - 3.0.3-1.el7
- New upstream release

* Tue Aug 7 2018 Jenkins <jenkins@opennodecloud.com> - 3.0.2-1.el7
- New upstream release

* Sat Aug 4 2018 Jenkins <jenkins@opennodecloud.com> - 3.0.1-1.el7
- New upstream release

* Thu Aug 2 2018 Jenkins <jenkins@opennodecloud.com> - 3.0.0-1.el7
- New upstream release

* Mon Jul 30 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.9-1.el7
- New upstream release

* Wed Jul 25 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.8-1.el7
- New upstream release

* Mon Jun 25 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.6-1.el7
- New upstream release

* Fri Jun 8 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.5-1.el7
- New upstream release

* Fri Jun 1 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.4-1.el7
- New upstream release

* Tue May 22 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.3-1.el7
- New upstream release

* Mon May 14 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.2-1.el7
- New upstream release

* Mon Apr 9 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.1-1.el7
- New upstream release

* Sat Mar 24 2018 Jenkins <jenkins@opennodecloud.com> - 2.9.0-1.el7
- New upstream release

* Mon Feb 26 2018 Jenkins <jenkins@opennodecloud.com> - 2.8.9-1.el7
- New upstream release

* Sat Feb 17 2018 Jenkins <jenkins@opennodecloud.com> - 2.8.8-1.el7
- New upstream release

* Sun Feb 11 2018 Jenkins <jenkins@opennodecloud.com> - 2.8.7-1.el7
- New upstream release

* Sat Feb 3 2018 Jenkins <jenkins@opennodecloud.com> - 2.8.6-1.el7
- New upstream release

* Sat Jan 13 2018 Jenkins <jenkins@opennodecloud.com> - 2.8.5-1.el7
- New upstream release

* Fri Dec 22 2017 Jenkins <jenkins@opennodecloud.com> - 2.8.4-1.el7
- New upstream release

* Sun Dec 3 2017 Jenkins <jenkins@opennodecloud.com> - 2.8.3-1.el7
- New upstream release

* Mon Nov 27 2017 Jenkins <jenkins@opennodecloud.com> - 2.8.2-1.el7
- New upstream release

* Tue Nov 21 2017 Jenkins <jenkins@opennodecloud.com> - 2.8.1-1.el7
- New upstream release

* Wed Nov 8 2017 Jenkins <jenkins@opennodecloud.com> - 2.8.0-1.el7
- New upstream release

* Fri Nov 3 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.9-1.el7
- New upstream release

* Tue Oct 17 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.8-1.el7
- New upstream release

* Tue Oct 10 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.7-1.el7
- New upstream release

* Wed Oct 4 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.6-1.el7
- New upstream release

* Wed Oct 4 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.5-1.el7
- New upstream release

* Sat Sep 30 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.4-1.el7
- New upstream release

* Thu Sep 28 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.3-1.el7
- New upstream release

* Wed Sep 27 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.2-1.el7
- New upstream release

* Tue Sep 19 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.1-1.el7
- New upstream release

* Sun Sep 17 2017 Jenkins <jenkins@opennodecloud.com> - 2.7.0-1.el7
- New upstream release

* Mon Aug 28 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.9-1.el7
- New upstream release

* Sat Aug 26 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.8-1.el7
- New upstream release

* Sun Aug 6 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.7-1.el7
- New upstream release

* Tue Aug 1 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.6-1.el7
- New upstream release

* Mon Jul 17 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.5-1.el7
- New upstream release

* Fri Jul 14 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.4-1.el7
- New upstream release

* Wed Jul 12 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.3-1.el7
- New upstream release

* Mon Jul 3 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.1-1.el7
- New upstream release

* Fri Jun 23 2017 Jenkins <jenkins@opennodecloud.com> - 2.6.0-1.el7
- New upstream release

* Fri Jun 9 2017 Jenkins <jenkins@opennodecloud.com> - 2.5.5-1.el7
- New upstream release

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
