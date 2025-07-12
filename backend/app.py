#!/usr/bin/env python3
"""
Network Penetration Testing Automation Backend
Integrates with LLM for intelligent vulnerability analysis and reporting
"""

import asyncio
import json
import subprocess
import socket
import threading
import time
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import nmap
import requests
import xml.etree.ElementTree as ET
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Vulnerability:
    id: str
    severity: str
    port: int
    service: str
    issue: str
    risk_score: float
    cve: Optional[str] = None
    description: str = ""
    remediation: str = ""

@dataclass
class ScanResult:
    target: str
    scan_time: str
    vulnerabilities: List[Vulnerability]
    risk_score: float
    open_ports: List[int]
    services: Dict[int, str]

class PentestEngine:
    def __init__(self):
        self.nm = nmap.PortScanner()
        self.scan_results = {}
        self.llm_api_key = None  # Set your OpenAI API key here
        
    def set_llm_api_key(self, api_key: str):
        """Set OpenAI API key for LLM integration"""
        self.llm_api_key = api_key
    
    def port_scan(self, target: str, port_range: str = "1-1000") -> Dict:
        """Perform port scan using nmap"""
        logger.info(f"Starting port scan on {target}")
        
        try:
            self.nm.scan(target, port_range, arguments='-sS -sV -O --script vuln')
            
            open_ports = []
            services = {}
            
            for host in self.nm.all_hosts():
                for proto in self.nm[host].all_protocols():
                    ports = self.nm[host][proto].keys()
                    for port in ports:
                        state = self.nm[host][proto][port]['state']
                        if state == 'open':
                            open_ports.append(port)
                            service = self.nm[host][proto][port].get('name', 'unknown')
                            services[port] = service
            
            return {
                'target': target,
                'open_ports': open_ports,
                'services': services,
                'scan_data': dict(self.nm[target]) if target in self.nm else {}
            }
            
        except Exception as e:
            logger.error(f"Port scan failed: {str(e)}")
            return {'error': str(e)}
    
    def vulnerability_scan(self, target: str) -> List[Vulnerability]:
        """Perform vulnerability scanning"""
        logger.info(f"Starting vulnerability scan on {target}")
        
        vulnerabilities = []
        
        # Get port scan results first
        port_data = self.port_scan(target)
        if 'error' in port_data:
            return []
        
        # Analyze common vulnerabilities
        for port in port_data['open_ports']:
            service = port_data['services'].get(port, 'unknown')
            
            # Check for common vulnerable services
            if port == 22 and service == 'ssh':
                vuln = self.check_ssh_vulnerabilities(target, port)
                if vuln:
                    vulnerabilities.append(vuln)
            
            elif port == 80 and service == 'http':
                vuln = self.check_http_vulnerabilities(target, port)
                if vuln:
                    vulnerabilities.append(vuln)
            
            elif port == 443 and service == 'https':
                vuln = self.check_https_vulnerabilities(target, port)
                if vuln:
                    vulnerabilities.append(vuln)
            
            elif port == 3389 and service == 'rdp':
                vuln = self.check_rdp_vulnerabilities(target, port)
                if vuln:
                    vulnerabilities.append(vuln)
        
        return vulnerabilities
    
    def check_ssh_vulnerabilities(self, target: str, port: int) -> Optional[Vulnerability]:
        """Check SSH-specific vulnerabilities"""
        try:
            # Simple SSH version detection
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            sock.connect((target, port))
            banner = sock.recv(1024).decode('utf-8').strip()
            sock.close()
            
            if 'OpenSSH' in banner:
                # Check for old versions
                if any(v in banner for v in ['OpenSSH_7.', 'OpenSSH_6.', 'OpenSSH_5.']):
                    return Vulnerability(
                        id=f"ssh_{port}",
                        severity="High",
                        port=port,
                        service="ssh",
                        issue="Outdated SSH version detected",
                        risk_score=7.5,
                        description=f"SSH banner: {banner}",
                        remediation="Update to latest SSH version"
                    )
        except:
            pass
        return None
    
    def check_http_vulnerabilities(self, target: str, port: int) -> Optional[Vulnerability]:
        """Check HTTP-specific vulnerabilities"""
        try:
            response = requests.get(f"http://{target}:{port}", timeout=5)
            headers = response.headers
            
            # Check for missing security headers
            if 'X-Frame-Options' not in headers:
                return Vulnerability(
                    id=f"http_{port}",
                    severity="Medium",
                    port=port,
                    service="http",
                    issue="Missing X-Frame-Options header",
                    risk_score=5.0,
                    description="Website vulnerable to clickjacking attacks",
                    remediation="Add X-Frame-Options header"
                )
        except:
            pass
        return None
    
    def check_https_vulnerabilities(self, target: str, port: int) -> Optional[Vulnerability]:
        """Check HTTPS-specific vulnerabilities"""
        try:
            import ssl
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            with socket.create_connection((target, port), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=target) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Check certificate expiry
                    not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    if not_after < datetime.now():
                        return Vulnerability(
                            id=f"https_{port}",
                            severity="Medium",
                            port=port,
                            service="https",
                            issue="SSL certificate expired",
                            risk_score=6.0,
                            description="SSL certificate has expired",
                            remediation="Renew SSL certificate"
                        )
        except:
            pass
        return None
    
    def check_rdp_vulnerabilities(self, target: str, port: int) -> Optional[Vulnerability]:
        """Check RDP-specific vulnerabilities"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((target, port))
            sock.close()
            
            if result == 0:
                return Vulnerability(
                    id=f"rdp_{port}",
                    severity="Critical",
                    port=port,
                    service="rdp",
                    issue="RDP exposed to internet",
                    risk_score=9.0,
                    description="RDP service accessible from external network",
                    remediation="Restrict RDP access to trusted networks only"
                )
        except:
            pass
        return None
    
    def analyze_with_llm(self, vulnerabilities: List[Vulnerability], target: str) -> Dict:
        """Analyze vulnerabilities using LLM"""
        if not self.llm_api_key:
            logger.warning("LLM API key not set, using default analysis")
            return self.default_analysis(vulnerabilities, target)
        
        try:
            # Prepare vulnerability data for LLM analysis
            vuln_data = [asdict(v) for v in vulnerabilities]
            
            prompt = f"""
            Analyze the following network penetration test results for target {target}:
            
            Vulnerabilities found:
            {json.dumps(vuln_data, indent=2)}
            
            Please provide:
            1. Overall risk assessment
            2. Priority recommendations
            3. Executive summary
            4. Detailed remediation steps
            
            Format the response as JSON with keys: risk_assessment, priority_recommendations, executive_summary, remediation_steps
            """
            
            headers = {
                'Authorization': f'Bearer {self.llm_api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'gpt-3.5-turbo',
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 1000
            }
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    return {'analysis': content}
            else:
                logger.error(f"LLM API error: {response.status_code}")
                return self.default_analysis(vulnerabilities, target)
                
        except Exception as e:
            logger.error(f"LLM analysis failed: {str(e)}")
            return self.default_analysis(vulnerabilities, target)
    
    def default_analysis(self, vulnerabilities: List[Vulnerability], target: str) -> Dict:
        """Default analysis when LLM is not available"""
        critical_count = sum(1 for v in vulnerabilities if v.severity == "Critical")
        high_count = sum(1 for v in vulnerabilities if v.severity == "High")
        medium_count = sum(1 for v in vulnerabilities if v.severity == "Medium")
        low_count = sum(1 for v in vulnerabilities if v.severity == "Low")
        
        avg_risk = sum(v.risk_score for v in vulnerabilities) / len(vulnerabilities) if vulnerabilities else 0
        
        return {
            'risk_assessment': f"Overall risk score: {avg_risk:.1f}/10",
            'priority_recommendations': [
                f"Address {critical_count} critical vulnerabilities immediately",
                f"Address {high_count} high-risk vulnerabilities within 24 hours",
                f"Address {medium_count} medium-risk vulnerabilities within 1 week"
            ],
            'executive_summary': f"Scan of {target} revealed {len(vulnerabilities)} vulnerabilities. "
                               f"Risk level: {'High' if avg_risk > 7 else 'Medium' if avg_risk > 4 else 'Low'}",
            'remediation_steps': [v.remediation for v in vulnerabilities if v.remediation]
        }
    
    def generate_report(self, target: str) -> Dict:
        """Generate comprehensive penetration test report"""
        logger.info(f"Generating report for {target}")
        
        vulnerabilities = self.vulnerability_scan(target)
        llm_analysis = self.analyze_with_llm(vulnerabilities, target)
        
        avg_risk = sum(v.risk_score for v in vulnerabilities) / len(vulnerabilities) if vulnerabilities else 0
        
        report = {
            'target': target,
            'scan_time': datetime.now().isoformat(),
            'vulnerabilities': [asdict(v) for v in vulnerabilities],
            'vulnerability_count': len(vulnerabilities),
            'risk_score': round(avg_risk, 1),
            'llm_analysis': llm_analysis,
            'summary': {
                'critical': sum(1 for v in vulnerabilities if v.severity == "Critical"),
                'high': sum(1 for v in vulnerabilities if v.severity == "High"),
                'medium': sum(1 for v in vulnerabilities if v.severity == "Medium"),
                'low': sum(1 for v in vulnerabilities if v.severity == "Low")
            }
        }
        
        self.scan_results[target] = report
        return report

# Flask API
app = Flask(__name__)
CORS(app)

pentest_engine = PentestEngine()

@app.route('/api/scan', methods=['POST'])
def start_scan():
    """Start penetration test scan"""
    data = request.json
    target = data.get('target')
    
    if not target:
        return jsonify({'error': 'Target IP required'}), 400
    
    try:
        # Start scan in background thread
        def run_scan():
            report = pentest_engine.generate_report(target)
            logger.info(f"Scan completed for {target}")
        
        thread = threading.Thread(target=run_scan)
        thread.daemon = True
        thread.start()
        
        return jsonify({'status': 'started', 'target': target})
        
    except Exception as e:
        logger.error(f"Scan failed: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/results/<target>', methods=['GET'])
def get_results(target):
    """Get scan results for target"""
    if target in pentest_engine.scan_results:
        return jsonify(pentest_engine.scan_results[target])
    else:
        return jsonify({'error': 'No results found'}), 404

@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Get all scan reports"""
    reports = list(pentest_engine.scan_results.values())
    return jsonify(reports)

@app.route('/api/config', methods=['POST'])
def update_config():
    """Update configuration (e.g., LLM API key)"""
    data = request.json
    
    if 'llm_api_key' in data:
        pentest_engine.set_llm_api_key(data['llm_api_key'])
        return jsonify({'status': 'LLM API key updated'})
    
    return jsonify({'error': 'No valid config provided'}), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    logger.info("Starting PentestAI Backend Server")
    app.run(debug=True, host='0.0.0.0', port=5000)
